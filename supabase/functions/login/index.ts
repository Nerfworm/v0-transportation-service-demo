import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleCors } from '../_shared/auth.ts'

const AUTH_FAILURE = "Invalid username or password";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors.preflight) return cors.response;
  const { headers } = cors;

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username or password missing!" }),
        { status: 400, headers }
      );
    }

    // supabaseAdmin can't call signInWithPassword, and supabaseAuth can't create table entries, so we need both.
    const supabaseAuth = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!);
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: foundUserData, error: foundUserError } = await supabaseAdmin
    .from("account")
    .select("email, id")
    .eq("username", username)
    .single();

    const email = foundUserData?.email ?? "dummy@example.com"

    const { data: userData, error: userError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    });

    if (foundUserError || !foundUserData || userError || !userData.user) {
      console.error("signInWithPassword failed: ", userError?.message);
      return new Response(
        JSON.stringify({ error: AUTH_FAILURE }),
        { status: 401, headers }
      );
    }

    supabaseAdmin
    .from("cookie")
    .delete()
    .eq("account", foundUserData.id)
    .lt("expires", new Date().toISOString())
    .then(({ error }) => {
      if (error) console.error("Cookie purge failed: ", error.message);
    });

    const { data: cookieData, error: cookieError } = await supabaseAdmin
    .from("cookie")
    .insert({
      account: foundUserData.id
    })
    .select()
    .single();

    if (cookieError || !cookieData) {
      console.error("Cookie insert failed: ", cookieError?.message);
      return new Response(
        JSON.stringify({ error: cookieError?.message || "Failed to create cookie" }),
        { status: 500, headers }
      );
    }

    const cookieValue = cookieData.cookie;
    const expires = new Date(cookieData.expires).toUTCString();

    const responseHeaders = new Headers(headers);
    responseHeaders.append("Set-Cookie", `session=${cookieValue}; Expires=${expires}; HttpOnly; Secure; Path=/; SameSite=None`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: responseHeaders }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Unhandled error: ", message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers }
    );
  }
});

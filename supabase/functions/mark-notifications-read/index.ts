import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { authenticate, ROLE } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  const auth = await authenticate(req);
  if (!auth.success) return auth.response;

  const { account, headers } = auth;

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { ids } = await req.json() as { ids: number[] }

    if (!Array.isArray(ids) || !ids.every(Number.isInteger)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: "ids" must be an array of integers' }),
        { status: 400, headers }
      )
    }

    let query = supabase
    .from("notification")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient", account.id)
    .is("read_at", null);

    if (ids.length > 0) {
      query = query.in("id", ids);
    }

    const { error } = await query;

    if (error) {
      console.log("Error while marking notifications as read: ", error)

      return new Response(
        JSON.stringify({ error: "Failed to mark notifications as read" }),
        { status: 500, headers }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers }
    )
  }
});

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleCors } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors.preflight) return cors.response;
  const { headers } = cors;

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      role: roleName,
      username,
      password,
    } = await req.json();

    if (!firstName || !lastName || !email || !username || !password || !roleName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get role id
    const { data: roleData, error: roleError } = await supabase
      .from("role")
      .select("id")
      .eq("name", roleName)
      .single();

    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: "Role not found" }), { status: 400, headers });
    }

    const role_id = roleData.id;

    // Check if username exists. The field is already unique, but this gives a quick, nice error.
    const { data: existingUser } = await supabase
      .from("account")
      .select("id")
      .eq("username", username)
      .single();

    if (existingUser) {
      return new Response(JSON.stringify({ error: "Username already exists" }), { status: 400, headers });
    }

    // Create Supabase Auth user first
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    // If it failed, exit early.
    if (authError) {
      return new Response(JSON.stringify({ error: "Failed to create user" }), { status: 500, headers });
    }

    const user = authUser.user;

    // Create user settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("user_settings")
      .insert({})
      .select()
      .single();

    // If user settings failed, revert the supabase user and exit early.
    if (settingsError || !settingsData) {
      await supabase.auth.admin.deleteUser(user.id);
      return new Response(JSON.stringify({ error: "Failed to create user settings" }), { status: 500, headers });
    }

    // Create the new account
    const { data: accountData, error: accountError } = await supabase
      .from("account")
      .insert({
        role_id,
        settings_id: settingsData.id,
        username,
        first_name: firstName,
        last_name: lastName,
        phone: phone ?? null,
        supabase_uid: user.id,
      })
      .select()
      .single();

    // If there was an error creating the account, delete it and the user settings.
    if (accountError) {
      await supabase.auth.admin.deleteUser(user.id);
      await supabase.from("user_settings").delete().eq("id", settingsData.id);
      return new Response(JSON.stringify({ error: accountError.message }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ account: accountData }), { status: 201, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), { status: 500, headers });
  }
});

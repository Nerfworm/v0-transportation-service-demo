import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { authenticate } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  const auth = await authenticate(req);
  if (!auth.success) return auth.response;

  const { account, headers } = auth;
  const supabase_id = account.supabase_uid;
  const user_id = account.id;

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  try {
    const {
      firstName,
      lastName,
      username,
      email,
      phone,
    } = await req.json();

    if (email !== undefined && (!email || typeof email !== "string")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers });
    }

    if (username !== undefined && (!username || typeof username !== "string")) {
      return new Response(JSON.stringify({ error: "Invalid username" }), { status: 400, headers });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (username) {
      const { data: existingUsername } = await supabase
      .from("account")
      .select("id")
      .eq("username", username)
      .neq("id", user_id)
      .maybeSingle();

      if (existingUsername) {
        return new Response(
          JSON.stringify({ error: "Username is already taken" }),
          { status: 409, headers }
        );
      }
    }

    let updatedAuth = null;
    if (email) {
      const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
        supabase_id,
        { email }
      );

      if (authError) {
        const isDuplicate = authError.message.toLowerCase().includes("already been registered");
        return new Response(
          JSON.stringify({ error: isDuplicate ? "Email is already in use" : authError.message }),
          { status: isDuplicate ? 409 : 500, headers }
        );
      }
      updatedAuth = authData;
    }

    const accountUpdates: Record<string, string> = {};
    if (firstName) accountUpdates.first_name = firstName;
    if (lastName)  accountUpdates.last_name  = lastName;
    if (username)  accountUpdates.username   = username;
    if (phone)     accountUpdates.phone      = phone;

    let updatedAccount = account;
    if (Object.keys(accountUpdates).length > 0) {
      const { data: accountData, error: accountError } = await supabase
      .from("account")
      .update(accountUpdates)
      .eq("id", user_id)
      .select()
      .single();

      if (accountError) {
        const { error: rollbackError } = await supabase.auth.admin.updateUserById(supabase_id, { email: account.email });
        if (rollbackError) {
          console.error("Auth rollback failed: ", rollbackError.message);
          return new Response(
            JSON.stringify({
              error: "Account update failed and auth email rollback failed. Contact support.",
              details: { accountError: accountError.message, rollbackError: rollbackError.message }
            }),
            { status: 500, headers }
          );
        }

        return new Response(
          JSON.stringify({ error: accountError.message }),
          { status: 500, headers }
        );
      }
      updatedAccount = accountData
    }

    return new Response(
      JSON.stringify({ account: updatedAccount, auth: updatedAuth }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
});

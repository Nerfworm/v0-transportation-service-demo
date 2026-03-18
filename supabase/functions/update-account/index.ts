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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(supabase_id);

    if (authError) {
      return new Response(
        JSON.stringify({ authError }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({ authData }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
});

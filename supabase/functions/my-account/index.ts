import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { authenticate } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  const auth = await authenticate(req);
  if (!auth.success) return auth.response;

  const { account, headers } = auth;

  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  return new Response(
    JSON.stringify({ valid: true, first_name: account.first_name, last_name: account.last_name, email: account.email, username: account.username, phone: account.phone }),
    { status: 200, headers }
  );
});

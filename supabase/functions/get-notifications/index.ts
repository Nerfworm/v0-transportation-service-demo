import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { authenticate, ROLE } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  const auth = await authenticate(req);
  if (!auth.success) return auth.response;

  const { account, headers } = auth;

  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data, error } = await supabase
  .from("notification")
  .select("id, title, body, created_at, read_at")
  .eq("recipient", account.id)
  .is("read_at", null)
  .order("created_at", { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch notifications" }),
      { status: 500, headers }
    );
  }

  return new Response(
    JSON.stringify({ data }),
    { status: 200, headers }
  )
});

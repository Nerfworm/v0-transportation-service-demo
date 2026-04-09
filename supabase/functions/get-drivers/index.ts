import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { authenticate, ROLE } from '../_shared/auth.ts'

Deno.serve(async (req: Request) => {
  const auth = await authenticate(req);
  if (!auth.success) return auth.response;

  const { account, headers } = auth;
  const role = account.role_id;

  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  // Only Admins and Transportation Coordinators can use this
  if (role === ROLE.REVIEWER || role === ROLE.TRANSPORTER) {
    return new Response(
      JSON.stringify({ error: "You do not have permission to see this data." }),
      { status: 403, headers }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: drivers, error: driverError } = await supabase
  .from("account")
  .select("id, first_name, last_name, phone, supabase_uid")
  .eq("role_id", ROLE.TRANSPORTER);

  if (driverError) {
    return new Response(
      JSON.stringify({ error: "Error while obtaining request data" }),
      { status: 500, headers }
    );
  }

  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    return new Response(
      JSON.stringify({ error: "Error fetching auth users" }),
      { status: 500, headers }
    );
  }

  const authMap = new Map(authUsers.users.map(u => [u.id, u.email]));

  const driversWithEmail = drivers.map((driver) => ({
    ...driver,
    email: authMap.get(driver.supabase_uid) ?? null
  }));

  return new Response(
    JSON.stringify({ valid: true, data: driversWithEmail }),
    { status: 200, headers }
  );
});

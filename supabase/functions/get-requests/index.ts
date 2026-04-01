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

  // Transporters cannot use this endpoint
  if (role === ROLE.TRANSPORTER) {
    return new Response(
      JSON.stringify({ error: "You do not have permission to see this data." }),
      { status: 403, headers }
    );
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let query = supabase
  .from("request")
  .select(`
    first_name,
    last_name,
    house_id,
    email,
    phone,
    source_address,
    destination_address,
    requested_dropoff_time,
    request_comment,
    approved,
    approval_comment,
    transport:transport_id (
      account:staff_id (
        first_name,
        last_name
      ),
      vehicle
    )
  `);

  // Admins see all requests.
  // TCs only see reviewed requests.
  // Reviewers only see unreviewed requests.
  if (role === ROLE.TRANSPORTATION_COORDINATOR) {
    query = query.neq("approved", "Unreviewed");
  } else if (role === ROLE.REVIEWER) {
    query = query.eq("approved", "Unreviewed");
  }

  const { data: requestData, error: requestError } = await query;

  if (requestError) {
    return new Response(
      JSON.stringify({ error: "Error while obtaining request data" }),
      { status: 500, headers }
    );
  }

  return new Response(
    JSON.stringify({ valid: true, data: requestData }),
    { status: 200, headers }
  );
});

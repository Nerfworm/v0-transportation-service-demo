import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleCors, ROLE } from '../_shared/auth.ts'
import { notifyRole } from '../_shared/notify.ts'

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
      houseId,
      email,
      phone,
      sourceAddress,
      destinationAddress,
      dropoffTime,
      comments,
    } = await req.json();

    if (!firstName || !lastName || !houseId || !sourceAddress || !destinationAddress || !dropoffTime) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers }
      );
    }

    const dropoff = new Date(dropoffTime);

    if (isNaN(dropoff.getTime())) {
      return new Response(
        JSON.stringify({ error: "Invalid dropoff time" }),
        { status: 400, headers }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabase
    .from("request")
    .insert({
      first_name: firstName,
      last_name: lastName,
      house_id: houseId,
      email,
      phone,
      source_address: sourceAddress,
      destination_address: destinationAddress,
      requested_dropoff_time: dropoff.toISOString(),
      request_comment: comments,
    })
    .select()
    .single();

    if (error) {
      console.error("Insert failed: ", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to create request" }),
        { status: 500, headers }
      );
    }

    try {
      await notifyRole(
        ROLE.REVIEWER,
        "Request submitted by " + firstName + " " + lastName,
        firstName + " " + lastName + " submitted a transportation request to get to " + destinationAddress + "."
      );
    } catch (err) {
      console.error("Warning: Failed to create notification!", err);
    }

    return new Response(
      JSON.stringify({ data }),
      { status: 200, headers }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Unhandled error: ", message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }), { status: 500, headers }
    );
  }
});

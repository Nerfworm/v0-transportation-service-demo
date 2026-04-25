import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { handleCors, ROLE } from '../_shared/auth.ts'
import { notifyRole } from '../_shared/notify.ts'
import { authenticate } from '../_shared/auth.ts'

async function getTravelDurationSeconds(origin: string, destination: string, departureTime?: Date): Promise<number | null> {
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY is not set");
    return null;
  }

  try {
    const res = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // Only request the duration field to minimize billing cost
        "X-Goog-FieldMask": "routes.duration",
      },
      body: JSON.stringify({
        origin: { address: origin },
        destination: { address: destination },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        ...(departureTime ? { departureTime: departureTime.toISOString() } : {}),
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("Routes API error:", json?.error?.message ?? res.statusText);
      return null;
    }

    // duration is returned as a string like "300s"
    const durationStr: string | undefined = json?.routes?.[0]?.duration;
    if (!durationStr) {
      console.error("Routes API returned no duration");
      return null;
    }

    const seconds = parseInt(durationStr.replace("s", ""), 10);
    return isNaN(seconds) ? null : seconds;
  } catch (err) {
    console.error("Routes API request failed:", err);
    return null;
  }
}

async function getTravelDurationSecondsWithArrival(origin: string, destination: string, arrivalTime: Date): Promise<number | null> {
  // First pass: get a rough duration without traffic to estimate departure time
  const roughDuration = await getTravelDurationSeconds(origin, destination);
  const estimatedDeparture = roughDuration !== null
  ? new Date(arrivalTime.getTime() - roughDuration * 1000)
  : new Date(arrivalTime.getTime() - 30 * 60 * 1000);

  // Second pass: re-query with the estimated departure time for accurate traffic conditions
  return await getTravelDurationSeconds(origin, destination, estimatedDeparture);
}

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
      manual,
      returnPickupTime,
    } = await req.json();

    let isManual = false;
    if (manual) {
      const auth = await authenticate(req);
      if (!auth.success) return auth.response;
      if (auth.account.role_id !== ROLE.TRANSPORTATION_COORDINATOR && auth.account.role_id !== ROLE.ADMIN) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers });
      }
      isManual = true;
    }

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

    const FALLBACK_BUFFER_MS = 30 * 60 * 1000;
    const outboundDuration = await getTravelDurationSecondsWithArrival(sourceAddress, destinationAddress, dropoff);
    const requestedPickupTime = outboundDuration !== null
      ? new Date(dropoff.getTime() - outboundDuration * 1000)
      : new Date(dropoff.getTime() - FALLBACK_BUFFER_MS);

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
      requested_pickup_time: requestedPickupTime.toISOString(),
      request_comment: comments,
      is_return: false,
      approved: isManual ? "Pending" : "Unreviewed",
    })
    .select()
    .single();

    if (error) {
      console.error("Insert failed: ", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to create request" }),
        { status: 500, headers }
      );
    } else if (!isManual) {
      try {
        await notifyRole(
          ROLE.REVIEWER,
          "Request submitted by " + firstName + " " + lastName,
          firstName + " " + lastName + " submitted a transportation request to get to " + destinationAddress + "."
        );
      } catch (err) {
        console.error("Warning: Failed to create notification!", err);
      }
    }

    if (returnPickupTime) {
      const returnPickup = new Date(returnPickupTime);
      if (isNaN(returnPickup.getTime())) {
        return new Response(JSON.stringify({ error: "Invalid return pickup time" }), { status: 400, headers });
      }

      const returnDuration = await getTravelDurationSeconds(destinationAddress, sourceAddress, returnPickup);
      const returnDropoffTime = returnDuration !== null
      ? new Date(returnPickup.getTime() + returnDuration * 1000)
      : new Date(returnPickup.getTime() + FALLBACK_BUFFER_MS);

      const { error: rError } = await supabase
      .from("request")
      .insert({
        first_name: firstName,
        last_name: lastName,
        house_id: houseId,
        email,
        phone,
        source_address: destinationAddress,
        destination_address: sourceAddress,
        requested_pickup_time: returnPickup.toISOString(),
        requested_dropoff_time: returnDropoffTime.toISOString(),
        is_return: true,
        request_comment: `Return trip. ${comments ?? ""}`.trim(),
        approved: isManual ? "Pending" : "Unreviewed",
      })
      .select()
      .single();

      if (rError) {
        console.error("Return trip insert failed: ", rError.message);
      }
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

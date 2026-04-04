import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { authenticate, ROLE } from '../_shared/auth.ts'

const ALLOWED_STATES: Partial<Record<number, string[]>> = {
  [ROLE.ADMIN]: ["Denied", "Pending", "Approved"],
  [ROLE.TRANSPORTATION_COORDINATOR]: ["Denied", "Approved"],
  [ROLE.REVIEWER]: ["Denied", "Pending"],
}

const ALLOWED_EDITS: Partial<Record<number, string[]>> = {
  [ROLE.ADMIN]: ["Unreviewed", "Denied", "Pending", "Approved"],
  [ROLE.TRANSPORTATION_COORDINATOR]: ["Pending"],
  [ROLE.REVIEWER]: ["Unreviewed"]
}

Deno.serve(async (req: Request) => {
  const auth = await authenticate(req);
  if (!auth.success) return auth.response;

  const { account, headers } = auth;
  const role = account.role_id;

  if (req.method !== "PUT") {
    return new Response("Method Not Allowed", { status: 405, headers });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const {
      requestId,
      newState,
      driver,
      vehicle,
      pickupTime,
      dropoffTime,
      reason,
    } = await req.json();

    if (!requestId || !newState) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters." }),
        { status: 400, headers }
      )
    }

    const { data: existingRequestData, error: existingRequestError } = await supabase
    .from("request")
    .select("approved")
    .eq("id", requestId)
    .single();

    if (existingRequestError || !existingRequestData) {
      return new Response(
        JSON.stringify({ error: "Request not found in request table." }),
        { status: 404, headers }
      )
    }

    const existingState = existingRequestData.approved;
    const allowedStates = ALLOWED_STATES[role];
    const allowedEdits = ALLOWED_EDITS[role];

    if (!allowedStates || !allowedEdits) {
      return new Response(
        JSON.stringify({ error: "Your role cannot update request states." }),
        { status: 403, headers }
      );
    }

    if (!allowedStates.includes(newState)) {
      return new Response(
        JSON.stringify({ error: `Invalid state "${newState}" for your role. Allowed: ${allowedStates.join(", ")}.` }),
        { status: 400, headers }
      )
    }

    if (!allowedEdits.includes(existingState)) {
      return new Response(
        JSON.stringify({ error: "Your role cannot update requests in this state." }),
        { status: 403, headers }
      );
    }

    if (!(newState === "Denied") && reason) {
      return new Response(
        JSON.stringify({ error: "Denial reason only present for denied requests." }),
        { status: 400, headers }
      )
    }

    if (!(newState === "Approved") && (driver || vehicle || pickupTime || dropoffTime)) {
      return new Response(
        JSON.stringify({ error: "Non-approved requests do not have driver information." }),
        { status: 400, headers }
      )
    }

    const requestUpdate: Record<string, unknown> = { approved: newState };
    if (newState === "Denied") requestUpdate.approval_comment = reason ?? null;
    if (newState !== "Denied") requestUpdate.approval_comment = null;

    requestUpdate.reviewed_by = account.id;
    requestUpdate.reviewed_at = new Date().toISOString();

    if (newState === "Approved") {
      if (!driver || !vehicle || !pickupTime || !dropoffTime) {
        return new Response(
          JSON.stringify({ error: "Approved requests require driver, vehicle, pickupTime, and dropoffTime." }),
          { status: 400, headers }
        );
      }

      const { data: transportData, error: transportError } = await supabase
      .from("transport")
      .insert({
        staff_id: driver,
        pickup_time: pickupTime,
        dropoff_time: dropoffTime,
        vehicle: vehicle,
      })
      .select("id")
      .single();

      if (transportError) {
        return new Response(
          JSON.stringify({ error: transportError.message }),
          { status: 500, headers }
        );
      }

      requestUpdate.transport_id = transportData.id;
    }

    const { error: requestError } = await supabase
    .from("request")
    .update(requestUpdate)
    .eq("id", requestId);

    if (requestError) {
      return new Response(
        JSON.stringify({ error: requestError.message }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({ valid: true }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
});

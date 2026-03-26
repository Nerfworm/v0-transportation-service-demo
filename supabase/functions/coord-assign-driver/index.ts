import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(name + "=")) return decodeURIComponent(part.slice(name.length + 1));
  }
  return null;
}

async function getAuthedAccount(supabaseAdmin: any, session: string) {
  const { data: cookieRow, error: cookieErr } = await supabaseAdmin
    .from("cookie")
    .select("account, expires")
    .eq("cookie", session)
    .single();

  if (cookieErr || !cookieRow) return { error: "Invalid session" };

  const exp = new Date(cookieRow.expires).getTime();
  if (Number.isNaN(exp) || exp < Date.now()) return { error: "Session expired" };

  const { data: acct, error: acctErr } = await supabaseAdmin
    .from("account")
    .select("id, role_id")
    .eq("id", cookieRow.account)
    .single();

  if (acctErr || !acct) return { error: "Account not found" };
  return { account: acct };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Use POST" }), { status: 405, headers: corsHeaders });

  try {
    const session = getCookie(req, "session");
    if (!session) return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401, headers: corsHeaders });

    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const auth = await getAuthedAccount(supabaseAdmin, session);
    if ("error" in auth) return new Response(JSON.stringify({ error: auth.error }), { status: 401, headers: corsHeaders });

    const me = auth.account;

    // Coordinator (2) or Admin (1)
    if (![1, 2].includes(me.role_id)) {
      return new Response(JSON.stringify({ error: "Coordinators/Admin only" }), { status: 403, headers: corsHeaders });
    }

    const { transport_id, driver_account_id } = await req.json();
    if (!transport_id || !driver_account_id) {
      return new Response(JSON.stringify({ error: "Missing transport_id or driver_account_id" }), { status: 400, headers: corsHeaders });
    }

    // Verify driver exists + is a driver + is available
    const { data: driver, error: dErr } = await supabaseAdmin
      .from("account")
      .select("id, role_id, driver_status")
      .eq("id", driver_account_id)
      .single();

    if (dErr || !driver) return new Response(JSON.stringify({ error: "Driver not found" }), { status: 404, headers: corsHeaders });
    if (driver.role_id !== 4) return new Response(JSON.stringify({ error: "Target is not a driver" }), { status: 400, headers: corsHeaders });
    if (driver.driver_status !== "available") {
      return new Response(JSON.stringify({ error: "Driver is not available" }), { status: 400, headers: corsHeaders });
    }

    // Ensure driver is not already assigned to an active job
    const { data: active, error: aErr } = await supabaseAdmin
      .from("transport")
      .select("id")
      .eq("staff_id", driver_account_id)
      .is("dropoff_time", null)
      .limit(1);

    if (aErr) return new Response(JSON.stringify({ error: aErr.message }), { status: 400, headers: corsHeaders });
    if ((active ?? []).length > 0) {
      return new Response(JSON.stringify({ error: "Driver already has an active assignment" }), { status: 400, headers: corsHeaders });
    }

    // Assign ONLY if transport currently unassigned (prevents double-assign)
    const { data: updated, error: updErr } = await supabaseAdmin
      .from("transport")
      .update({ staff_id: driver_account_id })
      .eq("id", transport_id)
      .is("staff_id", null)
      .select("id, staff_id, pickup_time, dropoff_time, miles_driven")
      .single();

    if (updErr || !updated) {
      return new Response(JSON.stringify({ error: updErr?.message ?? "Transport already assigned or not found" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Flip driver to assigned
    await supabaseAdmin
      .from("account")
      .update({ driver_status: "assigned", last_seen: new Date().toISOString() })
      .eq("id", driver_account_id);

    // Optional: notify driver
    await supabaseAdmin.from("notification").insert({
      recipient: driver_account_id,
      title: "New assignment",
      body: `You have been assigned transport #${transport_id}.`,
    });

    return new Response(JSON.stringify({ ok: true, assigned: updated }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500, headers: corsHeaders });
  }
});
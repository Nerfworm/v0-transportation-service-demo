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
    if (me.role_id !== 4) return new Response(JSON.stringify({ error: "Drivers only" }), { status: 403, headers: corsHeaders });

    const { transport_id, pickup_time, dropoff_time, miles_driven } = await req.json();
    if (!transport_id) return new Response(JSON.stringify({ error: "Missing transport_id" }), { status: 400, headers: corsHeaders });

    const update: Record<string, any> = {};
    if (pickup_time !== undefined) update.pickup_time = pickup_time;     // ISO string recommended
    if (dropoff_time !== undefined) update.dropoff_time = dropoff_time;  // ISO string recommended
    if (miles_driven !== undefined) update.miles_driven = miles_driven;

    if (Object.keys(update).length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), { status: 400, headers: corsHeaders });
    }

    // Only update if this driver is assigned
    const { data: updated, error: updErr } = await supabaseAdmin
      .from("transport")
      .update(update)
      .eq("id", transport_id)
      .eq("staff_id", me.id)
      .select("id, staff_id, pickup_time, dropoff_time, miles_driven")
      .single();

    if (updErr || !updated) {
      return new Response(JSON.stringify({ error: updErr?.message ?? "Not allowed or transport not found" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    // Update last_seen always
    await supabaseAdmin.from("account").update({ last_seen: new Date().toISOString() }).eq("id", me.id);

    // If driver completed job, flip back to available
    if (dropoff_time !== undefined && dropoff_time !== null) {
      await supabaseAdmin
        .from("account")
        .update({ driver_status: "available", last_seen: new Date().toISOString() })
        .eq("id", me.id);
    }

    return new Response(JSON.stringify({ ok: true, updated }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500, headers: corsHeaders });
  }
});
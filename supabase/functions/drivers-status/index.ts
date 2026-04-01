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

    const { status } = await req.json();
    if (!["available", "offline"].includes(status)) {
      return new Response(JSON.stringify({ error: "Status must be 'available' or 'offline'" }), { status: 400, headers: corsHeaders });
    }

    // If driver is currently assigned, prevent switching to available/offline? (optional rule)
    // We'll allow it, but you can uncomment to prevent going offline mid-job:
    // const { data: active } = await supabaseAdmin.from("transport").select("id").eq("staff_id", me.id).is("dropoff_time", null).limit(1);
    // if (active?.length) return new Response(JSON.stringify({ error: "Cannot change status while assigned" }), { status: 400, headers: corsHeaders });

    const { error } = await supabaseAdmin
      .from("account")
      .update({ driver_status: status, last_seen: new Date().toISOString() })
      .eq("id", me.id);

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), { status: 500, headers: corsHeaders });
  }
});
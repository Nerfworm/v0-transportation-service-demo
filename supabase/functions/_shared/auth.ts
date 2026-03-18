import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

export const ROLE = {
  ADMIN: 1,
  TRANSPORTATION_COORDINATOR: 2,
  REVIEWER: 3,
  TRANSPORTER: 4
};

// Helper function to get a cookie from the given name.
function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const parts = cookieHeader.split(";").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith(name + "=")) return decodeURIComponent(part.slice(name.length + 1));
  }
  return null;
}

type CorsResult =
  | { preflight: true; response: Response }
  | { preflight: false; headers: Record<string, string> };

// Helper function to create cors headers and also handle the preflight case of cors checking.
// This can be called directly in cases of functions that do not use the cookie format.
export function handleCors(req: Request): CorsResult {
  const headers = {
    "Access-Control-Allow-Origin": "https://v0-transportation-service-demo.vercel.app",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return { preflight: true, response: new Response("ok", { headers }) };
  }

  return { preflight: false, headers };
}

type AuthSuccess = {
  success: true;
  account: {
    role_id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  headers: Record<string, string>;
};

type AuthFailure = {
  success: false;
  response: Response;
}

type AuthResult = AuthSuccess | AuthFailure;

// Helper function which gets the specified account information from the associated cookie.
export async function authenticate(req: Request): Promise<AuthResult> {
  // Get cors headers and session cookie
  const cors = handleCors(req);
  if (cors.preflight) return { success: false, response: cors.response };
  const { headers } = cors;

  const cookie = getCookie(req, "session");

  // Session cookie missing
  if (!cookie) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({ error: "Session cookie missing from request" }),
        { status: 400, headers }
      ),
    };
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Grab the cookie from the database
  const { data: cookieData, error: cookieError } = await supabaseAdmin
  .from("cookie")
  .select("account, expires")
  .eq("cookie", cookie)
  .single();

  // Cookie doesn't exist in the database
  if (cookieError || !cookieData) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({ error: "Cookie not found" }),
        { status: 404, headers }
      )
    };
  }

  // Check if the cookie is expired
  const now = new Date();
  const cleanExpires = cookieData.expires.split(".")[0] + "Z"; // Convert the timestamp into a JS timestamp
  const expires = new Date(cleanExpires);

  if (expires < now) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({ error: "Cookie expired. Please log in again." }),
        { status: 400, headers }
      )
    };
  }

  // Grab account info from the session cookie
  const { data: accountData, error: accountError } = await supabaseAdmin
  .from("account")
  .select("role_id, username, id, supabase_uid, first_name, last_name, email, phone")
  .eq("id", cookieData.account)
  .single();

  if (accountError || !accountData) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({ error: "Found no account associated with the specified cookie." }),
        { status: 404, headers }
      )
    };
  }

  return {
    success: true,
    account: accountData,
    headers
  };
}

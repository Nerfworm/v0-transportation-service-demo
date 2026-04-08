// Centralized API client for edge functions
// Only connects to the client request edge function for now

const BASE_URL = "https://svvguxhkhesrlzmydghw.supabase.co/functions/v1";

export async function fetchGetRequests(token: string) {
  const res = await fetch(`${BASE_URL}/get-requests`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch client requests");
  return data;
}

export async function fetchGetNotifications() {
  const res = await fetch(`${BASE_URL}/get-notifications`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch notifications");
  return data;
}

export async function markNotificationsRead(ids: number[]) {
  const res = await fetch(`${BASE_URL}/mark-notifications-read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    credentials: "include",
    body: JSON.stringify({ ids }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to mark notifications read");
  return data;
}

export async function fetchConfirmRequest(
  requestId: string,
  newState: string,
  reason?: string,
  driver?: string,
  vehicle?: string,
  pickupTime?: string,
  dropoffTime?: string
) {
  const res = await fetch(`${BASE_URL}/confirm-request`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    credentials: "include",
    body: JSON.stringify({
      requestId,
      newState,
      reason,
      driver,
      vehicle,
      pickupTime,
      dropoffTime,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update request state");
  return data;
}

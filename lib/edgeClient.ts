// Centralized API client for edge functions
// Only connects to the client request edge function for now

export async function fetchClientRequests(token: string) {
  // Replace with your actual edge function URL
  const url = "https://svvguxhkhesrlzmydghw.supabase.co/functions/v1/client-request";
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch client requests");
  return data;
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Bell } from "lucide-react"
import DashboardLayout from '@/components/DashboardLayout'

import { fetchGetRequests } from "@/lib/edgeClient"

// Add a client function to call the edge function for updating request status
async function setRequestPending(requestId: string) {
  const res = await fetch("/api/review-update-request", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId }),
  });
  return res.json();
}


interface ReviewRequest {
  id: string
  firstName: string
  lastName: string
  houseName: string
  email?: string
  phone?: string
  pickupAddress: string
  destinationAddress: string
  arrivalDate: string // new field
  arrivalTime: string
  comments?: string
  status?: "pending" | "approved" | "rejected"
}




export default function Page() {
  const router = useRouter()
  const [requests, setRequests] = useState<ReviewRequest[]>([])
  const [selected, setSelected] = useState<ReviewRequest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1);
  const REVIEWS_PER_PAGE = 6;
  const totalPages = Math.ceil(requests.length / REVIEWS_PER_PAGE);
  const paginatedRequests = requests.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);

  useEffect(() => {
    fetchGetRequests("")
      .then((res) => {
        setRequests(
          (res.data || [])
            .filter((r: any) => r.approved === "Unreviewed")
            .map((r: any, idx: number) => ({
              id: r.id || idx.toString(),
              firstName: r.first_name,
              lastName: r.last_name,
              houseName: r.house_id,
              email: r.email,
              phone: r.phone,
              pickupAddress: r.source_address,
              destinationAddress: r.destination_address,
              arrivalDate: r.requested_dropoff_time?.split(" ")[0] || "",
              arrivalTime: r.requested_dropoff_time?.split(" ")[1] || "",
              comments: r.request_comment,
              status: r.approved,
            }))
        );
      })
      .catch((err) => {
        if (err.message && (err.message.includes("Session cookie missing") || err.message.includes("not authenticated") || err.message.includes("Cookie expired") || err.message.includes("Cookie not found"))) {
          setError("You must be logged in to view requests.");
        } else {
          setError(err.message || "Failed to fetch requests");
        }
      });
  }, []);


  const approve = async (id: string) => {
    try {
      const res = await setRequestPending(id);
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "pending" } : r)));
        setSelected(null);
      } else {
        setError(res.error || "Failed to update status");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    }
  }

  const reject = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r)))
    setSelected(null)
  }

  function formatTime(time: string) {
    // Accepts 'YYYY-MM-DD HH:mm' or 'HH:mm' and returns 'h:mm AM/PM'
    const t = time.trim().split(" ").pop() || "";
    const [h, m] = t.split(":");
    if (!h || !m) return time;
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${m} ${ampm}`;
  }

  function formatDate(date: string) {
    // Accepts 'YYYY-MM-DD' and returns 'Month D, YYYY'
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <DashboardLayout>
      <div className="w-full px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">Incoming Transport Requests</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {error ? (
              <div className="col-span-full text-center text-red-600 py-8">{error}</div>
            ) : requests.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-8">No transport requests to review.</div>
            ) : (
              paginatedRequests.map((r) => (
                <Card key={r.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(r.firstName?.[0] || "").toUpperCase()}{(r.lastName?.[0] || "").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{r.firstName} {r.lastName}</CardTitle>
                      <Badge className={`mt-1 ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>House:</span> <span>{r.houseName}</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Pickup:</span> <span>{r.pickupAddress}</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Destination:</span> <span>{r.destinationAddress}</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Date:</span> <span>{formatDate(r.arrivalDate)}</span></div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Arrival:</span> <span>{formatTime(r.arrivalTime)}</span></div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" onClick={() => setSelected(r)}>View</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="mx-2 text-sm">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-96 max-w-[90vw] p-6">
            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">×</button>
            <h2 className="text-xl font-bold mb-2">{selected.firstName} {selected.lastName}</h2>
            <div className="space-y-2 text-sm">
              <div><strong>House Name:</strong> {selected.houseName}</div>
              {selected.email && <div><strong>Email:</strong> {selected.email}</div>}
              {selected.phone && <div><strong>Phone:</strong> {selected.phone}</div>}
              <div><strong>Pickup Address:</strong> {selected.pickupAddress}</div>
              <div><strong>Destination Address:</strong> {selected.destinationAddress}</div>
              <div><strong>Date of Arrival:</strong> {formatDate(selected.arrivalDate)}</div>
              <div><strong>Arrival Time:</strong> {formatTime(selected.arrivalTime)}</div>
              {selected.comments && <div><strong>Comments:</strong> {selected.comments}</div>}
              <div><strong>Status:</strong> {selected.status}</div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={() => approve(selected.id)} className="flex-1">Approve</Button>
              <Button variant="ghost" onClick={() => reject(selected.id)} className="flex-1">Reject</Button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function formatTime(time: string) {
  // Accepts 'YYYY-MM-DD HH:mm' or 'HH:mm' and returns 'h:mm AM/PM'
  const t = time.trim().split(" ").pop() || "";
  const [h, m] = t.split(":");
  if (!h || !m) return time;
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${m} ${ampm}`;
}

function formatDate(date: string) {
  // Accepts 'YYYY-MM-DD' and returns 'Month D, YYYY'
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

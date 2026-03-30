"use client"

import { useState, useEffect } from "react"
import { fetchGetRequests } from "@/lib/edgeClient"
interface ReviewRequest {
  id: string
  firstName: string
  lastName: string
  houseName: string
  email?: string
  phone?: string
  pickupAddress: string
  destinationAddress: string
  arrivalDate: string
  arrivalTime: string
  comments?: string
  status?: string
}

import { Bus, ChevronLeft, ChevronRight, Calendar, Users, Bell } from "lucide-react"
import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const HOURS = [
  "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
  "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
]



import { getWeekDates } from '@/lib/events'



// Event type for calendar
interface CalendarEvent {
  id: string;
  title: string;
  driver?: string;
  description?: string;
  location?: string;
  passengers?: string;
  notes?: string;
  hour: number;
}

export default function CalendarPage() {
    // Helper to get hour index from arrivalTime string (e.g., '14:00' or '2 PM')
    function getHourIndex(arrivalTime: string) {
      if (!arrivalTime) return -1;
      // Try 24-hour format first
      const match24 = arrivalTime.match(/^(\d{1,2}):/);
      if (match24) {
        let hour = parseInt(match24[1], 10);
        if (hour >= 0 && hour <= 23) return hour;
      }
      // Try 12-hour format with AM/PM
      const match12 = arrivalTime.match(/^(\d{1,2}) ?(AM|PM)$/i);
      if (match12) {
        let hour = parseInt(match12[1], 10);
        if (/PM/i.test(match12[2]) && hour !== 12) hour += 12;
        if (/AM/i.test(match12[2]) && hour === 12) hour = 0;
        return hour;
      }
      return -1;
    }
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [filterDriver, setFilterDriver] = useState("all")
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [requests, setRequests] = useState<ReviewRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [vehicle, setVehicle] = useState("");
    // Fetch drivers for approve modal
    useEffect(() => {
      async function fetchDrivers() {
        try {
          const res = await fetch("https://svvguxhkhesrlzmydghw.supabase.co/functions/v1/get-drivers", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            credentials: "include"
          });
          const data = await res.json();
          if (data.valid && Array.isArray(data.data)) {
            setDriversList(data.data);
          }
        } catch (err) {}
      }
      if (showApproveModal) fetchDrivers();
    }, [showApproveModal]);
  useEffect(() => {
    fetchGetRequests("")
      .then((res) => {
        setRequests(
          (res.data || [])
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
        setRequestError(err.message || "Failed to fetch requests");
      });
  }, []);

  const handleLogout = () => {
    router.push("/")
  }

  const weekDates = getWeekDates(currentDate)

  const goToPreviousWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 7)
      return newDate
    })
  }

  const goToNextWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 7)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <DashboardLayout>

      <div className="flex flex-row w-full h-full overflow-hidden">
        {/* Calendar Main Area */}
        <div className="flex-1 max-w-[70vw] min-w-[700px] bg-card rounded-xl shadow-lg overflow-hidden mr-8 h-[1150px] flex flex-col">
          <div className="p-4 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="text-lg font-semibold">{monthYear}</h2>
              <Button variant="default" className="ml-4" onClick={() => alert('Add Transport form coming soon!')}>
                + Add Transport
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter By Driver</span>
              <Select value={filterDriver} onValueChange={setFilterDriver}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Drivers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  <SelectItem value="john">John</SelectItem>
                  <SelectItem value="jane">Jane</SelectItem>
                  <SelectItem value="mike">Mike</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-x-auto overflow-y-auto h-full">
            <div className="min-w-[900px] flex-1 flex flex-col h-full">
              <div className="grid grid-cols-8 border-b border-border">
                <div className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border" />
                {weekDates.map((date, index) => (
                  <div key={index} className="p-3 text-center border-r border-border last:border-r-0">
                    <div className="text-xs font-medium text-muted-foreground">{DAYS[index]}</div>
                    <div
                      className={`text-lg font-bold ${
                        date.toDateString() === new Date().toDateString()
                          ? "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                          : ""
                      }`}
                    >
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              {HOURS.map((hour, hourIndex) => (
                <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
                  <div className="p-3 text-xs text-muted-foreground border-r border-border flex items-start justify-end">
                    {hour}
                  </div>
                  {weekDates.map((date, dayIndex) => {
                    // Find all approved requests for this day and hour
                    const approvedRequests = requests.filter(r => {
                      if (r.status !== "approved" && r.status !== "Approved") return false;
                      // Compare date
                      const reqDate = r.arrivalDate;
                      const cellDate = date.toISOString().split("T")[0];
                      if (reqDate !== cellDate) return false;
                      // Compare hour
                      const reqHour = getHourIndex(r.arrivalTime);
                      return reqHour === hourIndex;
                    });
                    return (
                      <div
                        key={dayIndex}
                        className="p-1 min-h-16 border-r border-border last:border-r-0 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        {approvedRequests.length > 0 && approvedRequests.map((ar, idx) => (
                          <div
                            key={ar.id}
                            className="bg-green-200 text-green-900 rounded px-2 py-1 text-xs font-semibold shadow mb-1"
                            onClick={() => setSelectedRequest(ar)}
                          >
                            {ar.firstName} {ar.lastName} <span className="font-normal">({ar.arrivalTime})</span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Expanded Sidebar with Requests Under Review */}
        <div className="w-[720px] max-w-[800px] bg-white rounded-xl shadow-lg flex flex-col p-6 overflow-y-auto sticky top-0 h-[1150px]">
          <h2 className="text-2xl font-bold mb-6">Requests Under Review</h2>
          {requestError ? (
            <div className="text-red-600 mb-4">{requestError}</div>
          ) : requests.filter(r => r.status === "Pending").length === 0 ? (
            <div className="text-muted-foreground">No requests under review.</div>
          ) : (
            <ul className="divide-y divide-border">
              {requests.filter(r => r.status === "Pending").map((r) => {
                // Format date as 'Month D, YYYY'
                const formattedDate = r.arrivalDate ? new Date(r.arrivalDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
                // Format time as 'h:mm AM/PM'
                let formattedTime = r.arrivalTime;
                if (r.arrivalTime && r.arrivalTime.includes(":")) {
                  const [h, m] = r.arrivalTime.split(":");
                  if (!isNaN(Number(h)) && !isNaN(Number(m))) {
                    const hour = parseInt(h, 10);
                    const ampm = hour >= 12 ? "PM" : "AM";
                    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
                    formattedTime = `${hour12}:${m} ${ampm}`;
                  }
                }
                return (
                  <li key={r.id} className="py-4 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors" onClick={() => setSelectedRequest(r)}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-lg">{r.firstName} {r.lastName}</span>
                      <span className="text-sm text-muted-foreground">{formattedDate} {formattedTime}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
            {/* Request Details Modal */}
            {selectedRequest && (
              <>
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedRequest(null)} />
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-96 max-w-[90vw] p-6">
                  <button onClick={() => setSelectedRequest(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">×</button>
                  <h2 className="text-xl font-bold mb-2">{selectedRequest.firstName} {selectedRequest.lastName}</h2>
                  <div className="space-y-2 text-sm">
                    <div><strong>House Name:</strong> {selectedRequest.houseName}</div>
                    {selectedRequest.email && <div><strong>Email:</strong> {selectedRequest.email}</div>}
                    {selectedRequest.phone && <div><strong>Phone:</strong> {selectedRequest.phone}</div>}
                    <div><strong>Pickup Address:</strong> {selectedRequest.pickupAddress}</div>
                    <div><strong>Destination Address:</strong> {selectedRequest.destinationAddress}</div>
                    <div><strong>Date of Arrival:</strong> {selectedRequest.arrivalDate}</div>
                    <div><strong>Arrival Time:</strong> {selectedRequest.arrivalTime}</div>
                    {selectedRequest.comments && <div><strong>Comments:</strong> {selectedRequest.comments}</div>}
                    <div><strong>Status:</strong> {selectedRequest.status}</div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button className="flex-1" onClick={() => setShowApproveModal(true)}>Approve</Button>
                                {/* Approve Modal */}
                                {showApproveModal && (
                                  <>
                                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowApproveModal(false)} />
                                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-96 max-w-[90vw] p-6">
                                      <button onClick={() => setShowApproveModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">×</button>
                                      <h2 className="text-xl font-bold mb-4">Assign Driver & Vehicle</h2>
                                      <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">Driver</label>
                                        <input
                                          type="text"
                                          className="w-full border rounded p-2 mb-1"
                                          placeholder="Search driver by name..."
                                          value={driverSearch}
                                          onChange={e => {
                                            setDriverSearch(e.target.value);
                                            setSelectedDriver(null);
                                          }}
                                        />
                                        <div className="border rounded bg-white max-h-32 overflow-y-auto">
                                          {driversList
                                            .filter(d =>
                                              (d.first_name + " " + d.last_name).toLowerCase().includes(driverSearch.toLowerCase())
                                            )
                                            .map(d => (
                                              <div
                                                key={d.supabase_uid}
                                                className={`px-3 py-2 cursor-pointer hover:bg-muted ${selectedDriver?.supabase_uid === d.supabase_uid ? 'bg-primary text-primary-foreground' : ''}`}
                                                onClick={() => setSelectedDriver(d)}
                                              >
                                                {d.first_name} {d.last_name}
                                              </div>
                                            ))}
                                        </div>
                                        {selectedDriver && (
                                          <div className="mt-1 text-xs text-muted-foreground">Selected: {selectedDriver.first_name} {selectedDriver.last_name}</div>
                                        )}
                                      </div>
                                      <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-1">Vehicle</label>
                                        <input
                                          type="text"
                                          className="w-full border rounded p-2"
                                          placeholder="Enter vehicle..."
                                          value={vehicle}
                                          onChange={e => setVehicle(e.target.value)}
                                        />
                                      </div>
                                      <div className="flex gap-3 mt-4">
                                        <Button className="flex-1" onClick={() => setShowApproveModal(false)}>Submit</Button>
                                        <Button variant="ghost" className="flex-1" onClick={() => setShowApproveModal(false)}>Cancel</Button>
                                      </div>
                                    </div>
                                  </>
                                )}
                    <Button variant="ghost" className="flex-1" onClick={() => setShowRejectModal(true)}>Reject</Button>
                  </div>
                </div>
              </>
            )}

            {/* Reject Reason Modal */}
            {showRejectModal && (
              <>
                <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowRejectModal(false)} />
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-96 max-w-[90vw] p-6">
                  <button onClick={() => setShowRejectModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">×</button>
                  <h2 className="text-xl font-bold mb-4">Reason for Rejection</h2>
                  <textarea
                    className="w-full border rounded p-2 mb-4 min-h-[80px]"
                    placeholder="Enter reason for rejection..."
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-3 mt-4">
                    <Button className="flex-1" onClick={() => setShowRejectModal(false)}>Submit</Button>
                    <Button variant="ghost" className="flex-1" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                  </div>
                </div>
              </>
            )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40" 
            onClick={() => setSelectedEvent(null)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-96 max-w-[90vw] p-8">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-900">{selectedEvent.title}</h2>
            
            <div className="space-y-4">
              {selectedEvent.driver && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">DRIVER</p>
                  <p className="text-gray-900">{selectedEvent.driver}</p>
                </div>
              )}
              
              {selectedEvent.description && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">DESCRIPTION</p>
                  <p className="text-gray-900">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.location && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">LOCATION</p>
                  <p className="text-gray-900">{selectedEvent.location}</p>
                </div>
              )}
              
              {selectedEvent.passengers && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">PASSENGERS</p>
                  <p className="text-gray-900">{selectedEvent.passengers}</p>
                </div>
              )}
              
              {selectedEvent.notes && (
                <div>
                  <p className="text-sm text-gray-500 font-semibold">NOTES</p>
                  <p className="text-gray-900">{selectedEvent.notes}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500 font-semibold">TIME</p>
                <p className="text-gray-900">{HOURS[selectedEvent.hour]}</p>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedEvent(null)}
              className="w-full mt-8 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </>
      )}

    </DashboardLayout>
  );
}

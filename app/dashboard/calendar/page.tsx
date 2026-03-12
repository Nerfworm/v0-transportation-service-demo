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
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [filterDriver, setFilterDriver] = useState("all")
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [requests, setRequests] = useState<ReviewRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
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
              status: r.approved === "Unreviewed" ? "pending" : r.approved,
            }))
            .filter((req: ReviewRequest) => req.status === "pending")
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
                  {weekDates.map((_, dayIndex) => {
                    // No events, just render empty cell
                    return (
                      <div
                        key={dayIndex}
                        className="p-1 min-h-16 border-r border-border last:border-r-0 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        {/* No event data */}
                      </div>
                    )
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
          ) : requests.filter(r => r.status === "pending").length === 0 ? (
            <div className="text-muted-foreground">No requests under review.</div>
          ) : (
            <ul className="divide-y divide-border">
              {requests.filter(r => r.status === "pending").map((r) => (
                <li key={r.id} className="py-4 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors" onClick={() => setSelectedRequest(r)}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{r.firstName} {r.lastName}</span>
                    <span className="text-sm text-muted-foreground">{r.arrivalDate} {r.arrivalTime}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
            {/* Request Details Modal */}
            {selectedRequest && (
              <>
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedRequest(null)} />
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-96 max-w-[90vw] p-8">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">{selectedRequest.firstName} {selectedRequest.lastName}</h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">HOUSE</p>
                      <p className="text-gray-900">{selectedRequest.houseName}</p>
                    </div>
                    {selectedRequest.email && (
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">EMAIL</p>
                        <p className="text-gray-900">{selectedRequest.email}</p>
                      </div>
                    )}
                    {selectedRequest.phone && (
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">PHONE</p>
                        <p className="text-gray-900">{selectedRequest.phone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">PICKUP ADDRESS</p>
                      <p className="text-gray-900">{selectedRequest.pickupAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">DESTINATION ADDRESS</p>
                      <p className="text-gray-900">{selectedRequest.destinationAddress}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">DATE OF ARRIVAL</p>
                      <p className="text-gray-900">{selectedRequest.arrivalDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">ARRIVAL TIME</p>
                      <p className="text-gray-900">{selectedRequest.arrivalTime}</p>
                    </div>
                    {selectedRequest.comments && (
                      <div>
                        <p className="text-sm text-gray-500 font-semibold">COMMENTS</p>
                        <p className="text-gray-900">{selectedRequest.comments}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 font-semibold">STATUS</p>
                      <p className="text-gray-900">{selectedRequest.status}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="w-full mt-8 bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  >
                    Close
                  </button>
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

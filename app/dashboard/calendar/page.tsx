"use client"

import { useState } from "react"
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



import { sampleEvents, getWeekDates } from '@/lib/events'
import type { CalendarEvent } from '@/lib/events'


// Types and sample requests copied from review/page.tsx
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
  status?: "pending" | "approved" | "rejected"
}

const sampleRequests: ReviewRequest[] = [
  {
    id: "r1",
    firstName: "Alice",
    lastName: "Green",
    houseName: "Maple House",
    email: "alice.green@email.com",
    pickupAddress: "123 Main St, Downtown",
    destinationAddress: "JFK International Airport, Terminal 4",
    arrivalDate: "2025-11-23",
    arrivalTime: "09:00",
    comments: "Needs wheelchair assistance. Please notify driver in advance.",
    status: "pending",
  },
  {
    id: "r2",
    firstName: "Bob",
    lastName: "Lee",
    houseName: "Oak House",
    phone: "+1 (555) 234-5678",
    pickupAddress: "Central Station, Platform 2",
    destinationAddress: "Conference Center, 456 Business Rd",
    arrivalDate: "2025-11-23",
    arrivalTime: "11:30",
    comments: "Large luggage. May need extra space.",
    status: "pending",
  },
  {
    id: "r3",
    firstName: "Maria",
    lastName: "Santos",
    houseName: "Pine House",
    email: "maria.santos@email.com",
    phone: "+1 (555) 876-5432",
    pickupAddress: "789 Elm St, Suburbia",
    destinationAddress: "City Hospital, 101 Health Ave",
    arrivalDate: "2025-11-24",
    arrivalTime: "14:15",
    comments: "Patient is non-ambulatory. Bring wheelchair ramp.",
    status: "pending",
  },
  {
    id: "r4",
    firstName: "David",
    lastName: "Nguyen",
    houseName: "Cedar House",
    pickupAddress: "University Dorms, 321 College Ln",
    destinationAddress: "Library, 654 Knowledge Blvd",
    arrivalDate: "2025-11-25",
    arrivalTime: "08:45",
    comments: "Early morning pickup requested.",
    status: "pending",
  },
  {
    id: "r5",
    firstName: "Fatima",
    lastName: "Ali",
    houseName: "Birch House",
    email: "fatima.ali@email.com",
    pickupAddress: "Mall Entrance, 222 Shopping Pl",
    destinationAddress: "Community Center, 333 Unity Dr",
    arrivalDate: "2025-11-26",
    arrivalTime: "16:00",
    comments: "Assistance with bags needed.",
    status: "pending",
  },
]

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  // ...existing code...
  const [filterDriver, setFilterDriver] = useState("all")
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

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
    <DashboardLayout
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      onSettingsClick={() => {
        router.push('/settings');
        setMenuOpen(false);
      }}
      onProfileClick={() => {
        router.push('/profile');
        setMenuOpen(false);
      }}
      onHelpClick={() => {
        router.push('/help');
        setMenuOpen(false);
      }}
    >

      <div className="flex flex-row w-full h-full min-h-[80vh]">
        {/* Calendar Main Area */}
        <div className="flex-1 max-w-[70vw] min-w-[700px] bg-card rounded-xl shadow-lg overflow-hidden mr-8 h-[1160px] flex flex-col">
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
                    const event = sampleEvents.find((e) => e.day === dayIndex && e.hour === hourIndex)
                    const isFiltered = filterDriver === "all" || (event && event.driver?.toLowerCase() === filterDriver.toLowerCase())
                    return (
                      <div
                        key={dayIndex}
                        className="p-1 min-h-16 border-r border-border last:border-r-0 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        {event && isFiltered && (
                          <div 
                            className="bg-accent text-accent-foreground text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <div className="font-medium">{event.title}</div>
                            {event.driver && <div className="text-muted-foreground">{event.driver}</div>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Expanded Sidebar with Requests Under Review */}
        <div className="flex-1 min-w-[520px] max-w-[800px] bg-white rounded-xl shadow-lg flex flex-col p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Requests Under Review</h2>
          {/* Requests List */}
          {sampleRequests && sampleRequests.length > 0 ? (
            <div className="flex flex-col gap-4">
              {sampleRequests.map((r) => (
                <div key={r.id} className="border border-border rounded-lg p-4 bg-card shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {(r.firstName?.[0] || '').toUpperCase()}{(r.lastName?.[0] || '').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{r.firstName} {r.lastName}</div>
                      <div className="text-xs text-muted-foreground">{r.houseName}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1"><span className="font-medium text-foreground">Pickup:</span> {r.pickupAddress}</div>
                  <div className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Destination:</span> {r.destinationAddress}</div>
                  <div className="flex gap-4 text-xs mt-2">
                    <div><span className="font-medium text-foreground">Date:</span> {r.arrivalDate}</div>
                    <div><span className="font-medium text-foreground">Time:</span> {r.arrivalTime}</div>
                  </div>
                  {r.comments && <div className="text-xs text-muted-foreground mt-1 italic">{r.comments}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No requests under review.</div>
          )}
        </div>
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


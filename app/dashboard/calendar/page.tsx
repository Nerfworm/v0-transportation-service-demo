"use client"

import { Bus, ChevronLeft, ChevronRight, Calendar, Users, Bell } from "lucide-react"
import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { fetchGetRequests, fetchConfirmRequest } from "@/lib/edgeClient"
import { getWeekDates } from '@/lib/events'

// Phone formatting utility
function formatPhoneNumber(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("1")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  let formatted = "+1 ";
  if (digits.length > 0) {
    formatted += "(" + digits.slice(0, 3);
  }
  if (digits.length >= 4) {
    formatted += ") " + digits.slice(3, 6);
  }
  if (digits.length >= 7) {
    formatted += "-" + digits.slice(6, 10);
  }
  return formatted.trim();
}

// Phone input component
function PhoneInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <input
      className="w-full border rounded p-2"
      placeholder="Phone"
      value={value}
      onChange={e => onChange(formatPhoneNumber(e.target.value))}
    />
  );
}

// Driver dropdown component
function DriverDropdown({ value, onChange, driversList }: {
  value: any,
  onChange: (driver: any) => void,
  driversList: any[],
}) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <div className="relative">
      <input
        type="text"
        className="w-full border rounded p-2 mb-1"
        placeholder="Search driver by name..."
        required
        value={
          value && typeof value === 'object' ? `${value.first_name} ${value.last_name}` : search || value || ''
        }
        onChange={e => {
          setSearch(e.target.value);
          onChange("");
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
      />
      {showDropdown && (
        <div className="border rounded bg-white max-h-40 overflow-y-auto shadow-md w-full mt-1" style={{position: 'relative'}}>
          {driversList
            .filter(d =>
              (d.first_name + " " + d.last_name).toLowerCase().includes(search.toLowerCase())
            )
            .map(d => (
              <div
                key={d.supabase_uid}
                className={`px-3 py-2 cursor-pointer transition-colors
                  ${value && typeof value === 'object' && value.supabase_uid === d.supabase_uid ? 'bg-gray-200 text-gray-900 font-semibold' : 'bg-white text-gray-900'}
                  hover:bg-gray-100 hover:text-black`}
                onMouseDown={e => {
                  e.preventDefault();
                  onChange(d);
                  setSearch(`${d.first_name} ${d.last_name}`);
                  setShowDropdown(false);
                }}
              >
                {d.first_name} {d.last_name}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// Centralized driver fetch
async function fetchGetDrivers() {
  const BASE_URL = "https://svvguxhkhesrlzmydghw.supabase.co/functions/v1";
  const res = await fetch(`${BASE_URL}/get-drivers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch drivers");
  console.log("first driver object:", JSON.stringify(data.data[0]));
  return data;
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
  arrivalDate: string
  arrivalTime: string
  comments?: string
  status?: string
  transport?: {
    pickup_time?: string;
    dropoff_time?: string;
    vehicle?: string;
    account?: {
      first_name?: string;
      last_name?: string;
    };
  };
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const HOURS = [
  "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
  "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
]

export default function CalendarPage() {
          // Helper to format time as 12-hour with AM/PM
          function formatTime12h(time: string) {
            if (!time) return '';
            const [h, m] = time.split(":");
            if (h === undefined || m === undefined) return time;
            let hour = parseInt(h, 10);
            const minute = m;
            if (isNaN(hour)) return time;
            const ampm = hour >= 12 ? "PM" : "AM";
            hour = hour % 12 === 0 ? 12 : hour % 12;
            return `${hour}:${minute} ${ampm}`;
          }
        const [pickupTime, setPickupTime] = useState("");
        const [dropoffTime, setDropoffTime] = useState("");
      // Approve handler
  async function handleApprove() {
    console.log("selectedDriver full object:", JSON.stringify(selectedDriver));
    if (!selectedRequest || !selectedDriver || !vehicle || !pickupTime || !dropoffTime) return;
    console.log("submitting approval:", {  
    requestId: selectedRequest.id,
    driver: selectedDriver.id,
    vehicle,
    pickupTime,
    dropoffTime
  });
    try {
      const fullPickupTime = `${selectedRequest.arrivalDate}T${pickupTime}:00Z`;
      const fullDropoffTime = `${selectedRequest.arrivalDate}T${dropoffTime}:00Z`;
      const res = await fetchConfirmRequest(
        selectedRequest.id,
        "Approved",
        undefined,
        selectedDriver.id,
        vehicle,
        fullPickupTime,
        fullDropoffTime
      );
      setShowApproveModal(false);
      setSelectedRequest(null);
      setVehicle("");
      setSelectedDriver(null);
      setRequestError(null);
      fetchGetRequests("").then((res) => {
        setRequests(transformRequests(res.data));
      });
    } catch (err: any) {
      setRequestError(err.message || "Failed to approve request");
    }
  }

  async function handleReject() {
    if (!selectedRequest || !rejectReason) return;
    try {
      const res = await fetchConfirmRequest(
        selectedRequest.id,
        "Denied",
        rejectReason
      );
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");
      setRequestError(null);
      fetchGetRequests("").then((res) => {
        setRequests(transformRequests(res.data));
      });
    } catch (err: any) {
      setRequestError(err.message || "Failed to reject request");
    }
  }
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
  const [showEventInfoModal, setShowEventInfoModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [requestError, setRequestError] = useState<string | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false);
  // Add Transport Modal state
  const [showAddTransportModal, setShowAddTransportModal] = useState(false);
  const [addTransportForm, setAddTransportForm] = useState({
    firstName: '',
    lastName: '',
    houseName: '',
    email: '',
    phone: '',
    pickupAddress: '',
    destinationAddress: '',
    arrivalDate: '',
    arrivalTime: '',
    driver: '',
    vehicle: '',
    pickupTime: '',
    dropoffTime: '',
    comments: '',
    passengers: '',
  });
  const [addTransportError, setAddTransportError] = useState<string | null>(null);
  const [driversList, setDriversList] = useState<any[]>([]);
  const [driverSearch, setDriverSearch] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [vehicle, setVehicle] = useState("");
    // Fetch drivers for approve modal
    useEffect(() => {
      async function fetchDrivers() {
        try {
          const data = await fetchGetDrivers();
          console.log("drivers data:", data.data);
          if (data.valid && Array.isArray(data.data)) {
            setDriversList(data.data);
          }
        } catch (err) {}
      }
      if (showApproveModal) fetchDrivers();
    }, [showApproveModal]);

    // Fetch drivers for Add Transport modal
    useEffect(() => {
      async function fetchDrivers() {
        try {
          const data = await fetchGetDrivers();
          console.log("drivers data (add transport):", data.data);
          if (data.valid && Array.isArray(data.data)) {
            setDriversList(data.data);
          }
        } catch (err) {}
      }
      if (showAddTransportModal) fetchDrivers();
    }, [showAddTransportModal]);
  // Helper to transform API data to ReviewRequest[]
  function transformRequests(data: any[]): ReviewRequest[] {
    return (data || [])
      .map((r: any, idx: number) => {
        let arrivalDate = "";
        let arrivalTime = "";
        if (r.requested_dropoff_time) {
          const date = new Date(r.requested_dropoff_time);
          arrivalDate = date.toLocaleDateString('en-CA'); // yyyy-mm-dd in local time
          arrivalTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }); // HH:mm in local time
        }
        return {
          id: r.id || idx.toString(),
          firstName: r.first_name,
          lastName: r.last_name,
          houseName: r.house_id,
          email: r.email,
          phone: r.phone,
          pickupAddress: r.source_address,
          destinationAddress: r.destination_address,
          arrivalDate,
          arrivalTime,
          comments: r.request_comment,
          status: r.approved,
          transport: r.transport,
        };
      });
  }

  useEffect(() => {
    // Load from localStorage first
    const cached = localStorage.getItem("calendar_requests");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setRequests(transformRequests(parsed));
      } catch {}
    }

    // Fetch and cache function
    const fetchAndCache = () => {
      fetchGetRequests("")
        .then((res) => {
          localStorage.setItem("calendar_requests", JSON.stringify(res.data || []));
          setRequests(transformRequests(res.data));
          setRequestError(null);
        })
        .catch((err) => {
          setRequestError(err.message || "Failed to fetch requests");
        });
    };

    fetchAndCache();
    const interval = setInterval(fetchAndCache, 60000);
    return () => clearInterval(interval);
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
              <Button variant="default" className="ml-4" onClick={() => setShowAddTransportModal(true)}>
                + Add Transport
              </Button>
                  {/* Add Transport Modal */}
                  {showAddTransportModal && (
                    <>
                      <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddTransportModal(false)} />
                      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-[420px] max-w-[95vw] p-6">
                        <button onClick={() => setShowAddTransportModal(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">×</button>
                        <h2 className="text-xl font-bold mb-4">Add New Transport</h2>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            setAddTransportError(null);
                            try {
                              // Validate required fields
                              const f = addTransportForm;
                              if (!f.firstName || !f.lastName || !f.houseName || !f.pickupAddress || !f.destinationAddress || !f.arrivalDate || !f.arrivalTime || !f.driver || !f.vehicle || !f.pickupTime || !f.dropoffTime) {
                                setAddTransportError("Please fill out all required fields.");
                                return;
                              }
                              // Compose ISO dropoff time
                              const dropoffISO = `${f.arrivalDate}T${f.arrivalTime}:00Z`;
                              // Compose driver id
                              let driverId = '';
                              if (typeof f.driver === 'object' && f.driver !== null) {
                                driverId = (f.driver as { supabase_uid: string }).supabase_uid;
                              } else if (typeof f.driver === 'string') {
                                driverId = f.driver;
                              }
                              // Call confirm-request edge function to create an approved transport
                              // fetchConfirmRequest expects 7 arguments: requestId, status, reason, driverId, vehicle, pickupTime, dropoffTime
                              const res = await fetchConfirmRequest(
                                "",
                                "Approved",
                                undefined,
                                driverId,
                                f.vehicle,
                                `${f.arrivalDate}T${f.pickupTime}:00Z`,
                                `${f.arrivalDate}T${f.dropoffTime}:00Z`
                              );
                              if (!res.valid) {
                                setAddTransportError(res.error || "Failed to create transport");
                                return;
                              }
                              setShowAddTransportModal(false);
                              setAddTransportForm({
                                firstName: '', lastName: '', houseName: '', email: '', phone: '',
                                pickupAddress: '', destinationAddress: '', arrivalDate: '', arrivalTime: '',
                                driver: '', vehicle: '', pickupTime: '', dropoffTime: '', comments: '', passengers: '',
                              });
                              // Optionally refresh requests
                              fetchGetRequests("").then((res) => {
                                setRequests(transformRequests(res.data));
                              });
                            } catch (err: any) {
                              setAddTransportError(err?.message || "Failed to create transport");
                            }
                          }}
                          className="space-y-3"
                        >
                          <div className="flex gap-2">
                            <input className="w-1/2 border rounded p-2" placeholder="First Name" required value={addTransportForm.firstName} onChange={e => setAddTransportForm(f => ({...f, firstName: e.target.value}))} />
                            <input className="w-1/2 border rounded p-2" placeholder="Last Name" required value={addTransportForm.lastName} onChange={e => setAddTransportForm(f => ({...f, lastName: e.target.value}))} />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="houseName" className="block text-sm font-semibold mb-1">House Name</label>
                            <Select
                              value={addTransportForm.houseName}
                              onValueChange={value => setAddTransportForm(f => ({ ...f, houseName: value }))}
                            >
                              <SelectTrigger id="houseName">
                                <SelectValue placeholder="Select House Name" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="7">7</SelectItem>
                                <SelectItem value="8">8</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <input className="w-full border rounded p-2" placeholder="Email" type="email" value={addTransportForm.email} onChange={e => setAddTransportForm(f => ({...f, email: e.target.value}))} />
                          <PhoneInput value={addTransportForm.phone} onChange={v => setAddTransportForm(f => ({...f, phone: v}))} />
                          <input className="w-full border rounded p-2" placeholder="Pickup Address" required value={addTransportForm.pickupAddress} onChange={e => setAddTransportForm(f => ({...f, pickupAddress: e.target.value}))} />
                          <input className="w-full border rounded p-2" placeholder="Destination Address" required value={addTransportForm.destinationAddress} onChange={e => setAddTransportForm(f => ({...f, destinationAddress: e.target.value}))} />
                          <div className="flex gap-2">
                            <input className="w-1/2 border rounded p-2" type="date" required value={addTransportForm.arrivalDate} onChange={e => setAddTransportForm(f => ({...f, arrivalDate: e.target.value}))} />
                            <input className="w-1/2 border rounded p-2" type="time" required value={addTransportForm.arrivalTime} onChange={e => setAddTransportForm(f => ({...f, arrivalTime: e.target.value}))} />
                          </div>
                          <DriverDropdown value={addTransportForm.driver} onChange={d => setAddTransportForm(f => ({...f, driver: d}))} driversList={driversList} />
                          <input className="w-full border rounded p-2" placeholder="Vehicle" required value={addTransportForm.vehicle} onChange={e => setAddTransportForm(f => ({...f, vehicle: e.target.value}))} />
                          <div className="flex gap-2">
                            <input className="w-1/2 border rounded p-2" type="time" placeholder="Pickup Time" value={addTransportForm.pickupTime} onChange={e => setAddTransportForm(f => ({...f, pickupTime: e.target.value}))} />
                            <input className="w-1/2 border rounded p-2" type="time" placeholder="Dropoff Time" value={addTransportForm.dropoffTime} onChange={e => setAddTransportForm(f => ({...f, dropoffTime: e.target.value}))} />
                          </div>
                          <input className="w-full border rounded p-2" placeholder="Passengers (optional)" value={addTransportForm.passengers} onChange={e => setAddTransportForm(f => ({...f, passengers: e.target.value}))} />
                          <textarea className="w-full border rounded p-2" placeholder="Comments (optional)" value={addTransportForm.comments} onChange={e => setAddTransportForm(f => ({...f, comments: e.target.value}))} />
                          {addTransportError && <div className="text-red-600 text-sm">{addTransportError}</div>}
                          <div className="flex gap-3 mt-4">
                            <Button className="flex-1" type="submit">Submit</Button>
                            <Button variant="ghost" className="flex-1" type="button" onClick={() => setShowAddTransportModal(false)}>Cancel</Button>
                          </div>
                        </form>
                      </div>
                    </>
                  )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter By Driver</span>
              <Select value={filterDriver} onValueChange={setFilterDriver}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All Drivers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drivers</SelectItem>
                  {driversList.map((d, idx) => (
                    <SelectItem key={d.supabase_uid ?? idx} value={d.supabase_uid ?? idx.toString()}>{d.first_name} {d.last_name}</SelectItem>
                  ))}
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
                            className="bg-primary/20 text-primary rounded px-2 py-1 text-xs font-semibold shadow mb-1 border border-primary/40"
                            onClick={() => { setSelectedRequest(ar); setShowEventInfoModal(true); }}
                          >
                            {ar.firstName} {ar.lastName} <span className="font-normal">({formatTime12h(ar.arrivalTime)})</span>
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
                  <li key={r.id} className="py-4 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors" onClick={() => { setSelectedRequest(r); setShowEventInfoModal(false); }}>
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
            {/* Info-only modal for calendar event click */}
            {selectedRequest && showEventInfoModal && (
              <>
                <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setSelectedRequest(null); setShowEventInfoModal(false); }} />
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-96 max-w-[90vw] p-6">
                  <button onClick={() => { setSelectedRequest(null); setShowEventInfoModal(false); }} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">×</button>
                  <h2 className="text-xl font-bold mb-2">{selectedRequest.firstName} {selectedRequest.lastName}</h2>
                  <div className="space-y-2 text-sm">
                    <div><strong>House Name:</strong> {selectedRequest.houseName}</div>
                    {selectedRequest.email && <div><strong>Email:</strong> {selectedRequest.email}</div>}
                    {selectedRequest.phone && <div><strong>Phone:</strong> {selectedRequest.phone}</div>}
                    <div><strong>Pickup Address:</strong> {selectedRequest.pickupAddress}</div>
                    <div><strong>Destination Address:</strong> {selectedRequest.destinationAddress}</div>
                    <div><strong>Date of Arrival:</strong> {selectedRequest.arrivalDate}</div>
                    <div><strong>Arrival Time:</strong> {formatTime12h(selectedRequest.arrivalTime)}</div>
                    {/* Show transport details if available */}
                    {selectedRequest.transport && (
                      <>
                        {selectedRequest.transport.pickup_time && (
                          <div><strong>Pickup Time:</strong> {formatTime12h(
                            new Date(selectedRequest.transport.pickup_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                          )}</div>
                        )}
                        {selectedRequest.transport.dropoff_time && (
                          <div><strong>Dropoff Time:</strong> {formatTime12h(
                            new Date(selectedRequest.transport.dropoff_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
                          )}</div>
                        )}
                        {selectedRequest.transport.vehicle && <div><strong>Vehicle:</strong> {selectedRequest.transport.vehicle}</div>}
                        {selectedRequest.transport.account && (
                          <div><strong>Driver:</strong> {selectedRequest.transport.account.first_name} {selectedRequest.transport.account.last_name}</div>
                        )}
                      </>
                    )}
                    {selectedRequest.comments && <div><strong>Comments:</strong> {selectedRequest.comments}</div>}
                    <div><strong>Status:</strong> {selectedRequest.status}</div>
                  </div>
                </div>
              </>
            )}
            {/* Original modal for requests sidebar (with approve/reject) */}
            {selectedRequest && !showEventInfoModal && (
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
                    {/* Approve Modal and Reject Modal remain unchanged */}
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
                              value={selectedDriver ? `${selectedDriver.first_name} ${selectedDriver.last_name}` : driverSearch}
                              onChange={e => {
                                setDriverSearch(e.target.value);
                                setSelectedDriver(null);
                                setShowDriverDropdown(true);
                              }}
                              onFocus={() => setShowDriverDropdown(true)}
                              onBlur={e => {
                                // Delay hiding dropdown to allow click selection
                                setTimeout(() => setShowDriverDropdown(false), 100);
                              }}
                            />
                            <div className="relative">
                              {showDriverDropdown && (
                                <div className="border rounded bg-white max-h-40 overflow-y-auto shadow-md w-full mt-1" style={{position: 'relative'}}>
                                  {driversList
                                    .filter(d =>
                                      (d.first_name + " " + d.last_name).toLowerCase().includes(driverSearch.toLowerCase())
                                    )
                                    .map(d => (
                                      <div
                                        key={d.supabase_uid}
                                        className={`px-3 py-2 cursor-pointer transition-colors
                                          ${selectedDriver?.supabase_uid === d.supabase_uid ? 'bg-gray-200 text-gray-900 font-semibold' : 'bg-white text-gray-900'}
                                          hover:bg-gray-100 hover:text-black`}
                                        onMouseDown={e => {
                                          e.preventDefault();
                                          setSelectedDriver(d);
                                          setDriverSearch(`${d.first_name} ${d.last_name}`);
                                          setShowDriverDropdown(false);
                                        }}
                                      >
                                        {d.first_name} {d.last_name}
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
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
                          <div className="mb-4">
                            <label className="block text-sm font-semibold mb-1">Pickup Time</label>
                            <input
                              type="time"
                              className="w-full border rounded p-2"
                              value={pickupTime}
                              onChange={e => setPickupTime(e.target.value)}
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-semibold mb-1">Dropoff Time</label>
                            <input
                              type="time"
                              className="w-full border rounded p-2"
                              value={dropoffTime}
                              onChange={e => setDropoffTime(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-3 mt-4">
                            <Button className="flex-1" onClick={handleApprove}>Submit</Button>
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
                    <Button className="flex-1" onClick={handleReject}>Submit</Button>
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

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Bell,
  ChevronRight,
  AlertCircle,
  Clock,
  MapPin,
  User,
  Car,
  CalendarDays,
} from "lucide-react"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchGetRequests } from "@/lib/edgeClient"
import { useUser, ROLE } from "@/context/UserContext"

// ─── Types ────────────────────────────────────────────────────────────────────

type Request = {
  id: string
  first_name: string
  last_name: string
  approved: string
  requested_dropoff_time?: string
  destination_address?: string
  source_address?: string
  transport?: {
    pickup_time?: string
    dropoff_time?: string
    vehicle?: string
    account?: { first_name?: string; last_name?: string }
  }
}

type Stats = {
  unreviewed: number
  pending: number
  approved: number
  denied: number
  total: number
  allRequests: Request[]
  recent: Request[]
  weekCounts: { day: string; count: number }[]
  todayCount: number
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getWeekCounts(requests: Request[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const counts = days.map((day, i) => {
    const dayStart = new Date(startOfWeek)
    dayStart.setDate(startOfWeek.getDate() + i)
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayStart.getDate() + 1)
    const count = requests.filter((r) => {
      const isApproved = r.approved === "approved" || r.approved === "Approved"
      if (!isApproved || !r.transport?.pickup_time) return false
      const d = new Date(r.transport.pickup_time)
      return d >= dayStart && d < dayEnd
    }).length
    return { day, count }
  })

  const todayIdx = now.getDay()
  return { weekCounts: counts, todayCount: counts[todayIdx].count }
}

function formatTimeFromISO(iso?: string) {
  if (!iso) return ""
  const d = new Date(iso)
  const h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, "0")
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${m} ${ampm}`
}

function formatDateLabel(isoDate: string) {
  if (!isoDate) return ""
  const d = new Date(isoDate + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (d.getTime() === today.getTime()) return "Today"
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow"
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function timeSince(iso?: string) {
  if (!iso) return ""
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function statusColor(s: string) {
  const map: Record<string, string> = {
    Unreviewed: "bg-blue-500",
    Pending: "bg-yellow-400",
    Approved: "bg-green-500",
    approved: "bg-green-500",
    Denied: "bg-red-500",
  }
  return map[s] ?? "bg-gray-400"
}

function rideStatus(pickupISO: string): { label: string; dotClass: string; textClass: string } {
  const diff = new Date(pickupISO).getTime() - Date.now()
  const mins = Math.round(diff / 60000)
  if (mins < 0 && mins > -120)
    return { label: "In progress", dotClass: "bg-green-500", textClass: "text-green-600" }
  if (mins < 0)
    return { label: "Completed", dotClass: "bg-gray-300", textClass: "text-muted-foreground" }
  if (mins < 60)
    return { label: `In ${mins}m`, dotClass: "bg-yellow-400", textClass: "text-yellow-600" }
  const hrs = Math.round(mins / 60)
  if (hrs < 24)
    return { label: `In ${hrs}h`, dotClass: "bg-muted", textClass: "text-muted-foreground" }
  return { label: "", dotClass: "", textClass: "" }
}

function bestDate(r: Request): Date | null {
  const iso = r.transport?.pickup_time ?? r.requested_dropoff_time
  if (!iso) return null
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

// ─── Week grouping: Approved + Pending, today → +6 days ──────────────────────

function groupUpcomingByWeek(requests: Request[]) {
  const keys: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    keys.push(d.toLocaleDateString("en-CA"))
  }

  const grouped: Record<string, Request[]> = {}
  keys.forEach((k) => (grouped[k] = []))

  requests.forEach((r) => {
    const status = r.approved?.toLowerCase()
    const isScheduled = status === "approved" || status === "pending"
    if (!isScheduled) return
    const d = bestDate(r)
    if (!d) return
    const key = d.toLocaleDateString("en-CA")
    if (grouped[key] !== undefined) grouped[key].push(r)
  })

  keys.forEach((k) => {
    grouped[k].sort((a, b) => bestDate(a)!.getTime() - bestDate(b)!.getTime())
  })

  return { keys, grouped }
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Unreviewed: "bg-blue-50 text-blue-700 border-blue-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Approved: "bg-green-50 text-green-700 border-green-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    Denied: "bg-red-50 text-red-700 border-red-200",
  }
  const s = styles[status] ?? "bg-gray-50 text-gray-600 border-gray-200"
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${s}`}>
      {status}
    </span>
  )
}

// ─── Widget: Stats overview ───────────────────────────────────────────────────

function StatsWidget({ stats, role }: { stats: Stats | null; role: number }) {
  const router = useRouter()

  if (!stats) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-muted/40 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (role === ROLE.REVIEWER) {
    return (
      <div className="cursor-pointer" onClick={() => router.push("/dashboard/review")}>
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
          Awaiting review
        </p>
        <p className="text-4xl font-semibold text-yellow-600">{stats.unreviewed}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {stats.pending} pending final approval
        </p>
        <p className="text-xs text-primary mt-3 flex items-center gap-1">
          Open review queue <ChevronRight className="h-3 w-3" />
        </p>
      </div>
    )
  }

  const buckets =
    role === ROLE.TRANSPORTATION_COORDINATOR
      ? [
          { label: "Pending",  value: stats.pending,  color: "text-yellow-600" },
          { label: "Approved", value: stats.approved, color: "text-green-600"  },
        ]
      : [
          { label: "Unreviewed", value: stats.unreviewed, color: "text-blue-600"   },
          { label: "Pending",    value: stats.pending,    color: "text-yellow-600" },
          { label: "Approved",   value: stats.approved,   color: "text-green-600"  },
          { label: "Denied",     value: stats.denied,     color: "text-red-600"    },
        ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {buckets.map((b) => (
          <div key={b.label} className="bg-muted/40 rounded-lg p-3">
            <p className={`text-2xl font-semibold ${b.color}`}>{b.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{b.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{stats.total} requests total</p>
    </div>
  )
}

// ─── Widget: Notifications ────────────────────────────────────────────────────

function NotificationsWidget({ count }: { count: number }) {
  return (
    <div>
      <p className={`text-4xl font-semibold ${count > 0 ? "text-yellow-600" : "text-green-600"}`}>
        {count}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        {count > 0 ? "unread notifications" : "all caught up"}
      </p>
      {count > 0 && (
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full"
            style={{ width: `${Math.min(100, count * 12)}%` }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Widget: Driver — my rides ────────────────────────────────────────────────

function MyRidesWidget({ stats }: { stats: Stats | null }) {
  const router = useRouter()

  if (!stats) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-14 bg-muted/40 rounded-md" />
        ))}
      </div>
    )
  }

  const myRides = stats.allRequests.filter(
    (r) => r.approved === "approved" || r.approved === "Approved"
  )

  if (myRides.length === 0) {
    return <p className="text-sm text-muted-foreground">No rides assigned.</p>
  }

  return (
    <div className="divide-y divide-border">
      {myRides.slice(0, 4).map((r) => (
        <div
          key={r.id}
          className="py-3 cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => router.push("/dashboard/calendar")}
        >
          <p className="text-sm font-medium">
            {r.first_name} {r.last_name}
          </p>
          {r.destination_address && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">{r.destination_address}</p>
            </div>
          )}
          {r.transport?.pickup_time && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Pickup: {formatTimeFromISO(r.transport.pickup_time)}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Widget: Week transport calendar ─────────────────────────────────────────

function WeekTransportWidget({ stats }: { stats: Stats | null }) {
  const router = useRouter()

  if (!stats) {
    return (
      <div className="animate-pulse grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-6 bg-muted/40 rounded" />
            <div className="h-12 bg-muted/30 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const { keys, grouped } = groupUpcomingByWeek(stats.allRequests)
  const todayKey = new Date().toLocaleDateString("en-CA")
  const totalThisWeek = keys.reduce((acc, k) => acc + grouped[k].length, 0)

  if (totalThisWeek === 0) {
    return (
      <div className="text-center py-6">
        <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="text-sm text-muted-foreground">No upcoming transports this week</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 rounded-full text-xs h-7"
          onClick={() => router.push("/dashboard/calendar")}
        >
          Open calendar
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="grid grid-cols-7 gap-1.5 min-w-[560px]">
        {keys.map((dateKey) => {
          const rides = grouped[dateKey]
          const isToday = dateKey === todayKey
          const d = new Date(dateKey + "T00:00:00")
          const dayName = d.toLocaleDateString("en-US", { weekday: "short" })
          const dayNum = d.getDate()

          return (
            <div
              key={dateKey}
              className={`flex flex-col rounded-lg border transition-all cursor-pointer
                ${isToday
                  ? "border-primary/40 bg-primary/5 shadow-sm"
                  : "border-border bg-muted/20 hover:bg-muted/40"
                }`}
              onClick={() => router.push("/dashboard/calendar")}
            >
              {/* Day header */}
              <div
                className={`px-2 py-1.5 border-b flex flex-col items-center
                  ${isToday ? "border-primary/20" : "border-border"}`}
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider
                    ${isToday ? "text-primary" : "text-muted-foreground"}`}
                >
                  {dayName}
                </span>
                <span
                  className={`text-base font-bold leading-tight
                    ${isToday ? "text-primary" : "text-foreground"}`}
                >
                  {dayNum}
                </span>
                {rides.length > 0 && (
                  <span
                    className={`text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full font-medium
                      ${isToday
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"}`}
                  >
                    {rides.length}
                  </span>
                )}
              </div>

              {/* Ride list */}
              <div className="flex flex-col gap-1 p-1.5 overflow-y-auto max-h-[180px]">
                {rides.length === 0 ? (
                  <div className="flex items-center justify-center h-10">
                    <span className="text-[10px] text-muted-foreground/40">—</span>
                  </div>
                ) : (
                  rides.map((r) => {
                    const pickupTime = formatTimeFromISO(
                      r.transport?.pickup_time ?? r.requested_dropoff_time
                    )
                    const driver = r.transport?.account
                      ? `${r.transport.account.first_name} ${r.transport.account.last_name}`
                      : null
                    const isPending = r.approved?.toLowerCase() === "pending"

                    return (
                      <div
                        key={r.id}
                        className={`rounded px-1.5 py-1 text-left transition-colors
                          ${isToday
                            ? "bg-primary/10 hover:bg-primary/20"
                            : "bg-background hover:bg-muted/60"
                          }`}
                      >
                        <p className="text-[11px] font-semibold text-foreground truncate leading-tight">
                          {r.first_name} {r.last_name}
                        </p>
                        {pickupTime && (
                          <p className={`text-[10px] ${isToday ? "text-primary/80" : "text-muted-foreground"}`}>
                            {pickupTime}
                          </p>
                        )}
                        {isPending ? (
                          <span className="text-[10px] text-yellow-600 font-medium">Pending</span>
                        ) : driver ? (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            <User className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                            <span className="text-[10px] text-muted-foreground truncate">{driver}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-yellow-600 font-medium">No driver</span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Widget: Recent activity ──────────────────────────────────────────────────

function RecentWidget({ stats }: { stats: Stats | null }) {
  const router = useRouter()

  if (!stats) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 bg-muted/40 rounded-md" />
        ))}
      </div>
    )
  }

  if (stats.recent.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent requests.</p>
  }

  return (
    <div className="divide-y divide-border">
      {stats.recent.map((r) => (
        <div key={r.id} className="flex items-center gap-3 py-2.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor(r.approved)}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {r.first_name} {r.last_name}
            </p>
            {r.destination_address && (
              <p className="text-xs text-muted-foreground truncate">{r.destination_address}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <StatusBadge status={r.approved} />
            <span className="text-[10px] text-muted-foreground">
              {timeSince(r.requested_dropoff_time)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const user = useUser()
  const role = user?.role_id ?? ROLE.REVIEWER
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [notifCount, setNotifCount] = useState(0)

  useEffect(() => {
    fetchGetRequests("")
      .then((res) => {
        const data: Request[] = res.data ?? []
        const { weekCounts, todayCount } = getWeekCounts(data)
        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.requested_dropoff_time ?? 0).getTime() -
            new Date(a.requested_dropoff_time ?? 0).getTime()
        )
        setStats({
          unreviewed: data.filter((r) => r.approved === "Unreviewed").length,
          pending:    data.filter((r) => r.approved === "Pending" || r.approved === "pending").length,
          approved:   data.filter((r) => r.approved === "Approved" || r.approved === "approved").length,
          denied:     data.filter((r) => r.approved === "Denied").length,
          total:      data.length,
          allRequests: data,
          recent:     sorted.slice(0, 4),
          weekCounts,
          todayCount,
        })
      })
      .catch(() => {})

    fetch("https://svvguxhkhesrlzmydghw.supabase.co/functions/v1/get-notifications", {
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => setNotifCount((d.data ?? []).length))
      .catch(() => {})
  }, [])

  const isAdmin    = role === ROLE.ADMIN
  const isTC       = role === ROLE.TRANSPORTATION_COORDINATOR
  const isReviewer = role === ROLE.REVIEWER
  const isDriver   = role === ROLE.TRANSPORTER

  return (
    <DashboardLayout>
      <section className="max-w-6xl mx-auto space-y-4">

        {/* ── Row 1: Stats · Notifications ──────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {isDriver
                  ? <><Calendar className="h-4 w-4" /> My rides</>
                  : isReviewer
                  ? <><Clock className="h-4 w-4" /> Review queue</>
                  : <><AlertCircle className="h-4 w-4" /> Request overview</>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDriver
                ? <MyRidesWidget stats={stats} />
                : <StatsWidget stats={stats} role={role} />}
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push("/settings")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NotificationsWidget count={notifCount} />
            </CardContent>
          </Card>

        </div>

        {/* ── Row 2: Week transport calendar — ALL roles ─────────────────── */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                This week's transports
              </span>
              <button
                className="text-xs text-primary font-normal hover:opacity-70 transition-opacity"
                onClick={() => router.push("/dashboard/calendar")}
              >
                Open calendar →
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeekTransportWidget stats={stats} />
          </CardContent>
        </Card>

        {/* ── Row 3: Recent requests — Admin and Reviewer ───────────────── */}
        {(isAdmin || isReviewer) && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" /> Recent requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentWidget stats={stats} />
            </CardContent>
          </Card>
        )}

      </section>
    </DashboardLayout>
  )
}
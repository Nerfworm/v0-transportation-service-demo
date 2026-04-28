"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Users,
  Bell,
  ChevronRight,
  AlertCircle,
  Clock,
  Zap,
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

// Best available date for sorting/grouping: transport pickup if set,
// otherwise fall back to the requested dropoff time.
function bestDate(r: Request): Date | null {
  const iso = r.transport?.pickup_time ?? r.requested_dropoff_time
  if (!iso) return null
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

function groupUpcomingByDay(requests: Request[]) {
  const upcoming = requests
    .filter((r) => {
      const isApproved = r.approved === "Approved" || r.approved === "approved"
      if (!isApproved) return false
      return bestDate(r) !== null
    })
    .sort((a, b) => bestDate(a)!.getTime() - bestDate(b)!.getTime())

  const grouped: Record<string, Request[]> = {}
  upcoming.forEach((r) => {
    const key = bestDate(r)!.toLocaleDateString("en-CA")
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(r)
  })

  return { grouped, total: upcoming.length }
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Unreviewed: "bg-blue-50 text-blue-700 border-blue-200",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
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

// ─── Widget: Navigation ───────────────────────────────────────────────────────

function NavWidget({ stats, role }: { stats: Stats | null; role: number }) {
  const router = useRouter()

  const badgeStyles: Record<string, string> = {
    info:    "bg-blue-50 text-blue-700",
    warn:    "bg-yellow-50 text-yellow-700",
    success: "bg-green-50 text-green-700",
    muted:   "bg-muted text-muted-foreground",
  }

  const links: { label: string; badge: string; href: string; variant: string }[] = [
    ...(role === ROLE.ADMIN || role === ROLE.TRANSPORTATION_COORDINATOR
      ? [{ label: "Calendar",     badge: stats ? `${stats.todayCount} today`      : "—", href: "/dashboard/calendar", variant: "info" }]
      : []),
    ...(role === ROLE.ADMIN || role === ROLE.REVIEWER
      ? [{ label: "Review queue", badge: stats ? `${stats.unreviewed} new`        : "—", href: "/dashboard/review",   variant: "warn" }]
      : []),
    ...(role === ROLE.ADMIN || role === ROLE.TRANSPORTATION_COORDINATOR
      ? [{ label: "Drivers",      badge: "",                                               href: "/dashboard/drivers", variant: "muted" }]
      : []),
    { label: "Settings", badge: "", href: "/settings", variant: "muted" },
  ]

  return (
    <div className="divide-y divide-border">
      {links.map((l) => (
        <button
          key={l.href}
          onClick={() => router.push(l.href)}
          className="w-full flex items-center justify-between py-3 text-left hover:opacity-70 transition-opacity group"
        >
          <span className="text-sm font-medium">{l.label}</span>
          {l.badge ? (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeStyles[l.variant]}`}>
              {l.badge}
            </span>
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Widget: Week sparkline ───────────────────────────────────────────────────

function WeekWidget({ stats }: { stats: Stats | null }) {
  const router = useRouter()

  if (!stats) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-24 bg-muted/40 rounded" />
        <div className="h-10 bg-muted/40 rounded" />
      </div>
    )
  }

  const max = Math.max(...stats.weekCounts.map((d) => d.count), 1)

  return (
    <div className="cursor-pointer" onClick={() => router.push("/dashboard/calendar")}>
      <p className="text-2xl font-semibold">
        {stats.todayCount}{" "}
        <span className="text-sm font-normal text-muted-foreground">rides today</span>
      </p>
      <div className="flex items-end gap-1 mt-4 h-10">
        {stats.weekCounts.map((d) => {
          const pct = Math.round((d.count / max) * 100)
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t transition-all duration-300"
                style={{
                  height: `${pct}%`,
                  minHeight: d.count > 0 ? 3 : 0,
                  background: d.count > 0
                    ? "hsl(221.2 83.2% 53.3%)"
                    : "hsl(214.3 31.8% 91.4%)",
                }}
              />
              <span className="text-[9px] text-muted-foreground">{d.day[0]}</span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-primary mt-3 flex items-center gap-1">
        View calendar <ChevronRight className="h-3 w-3" />
      </p>
    </div>
  )
}

// ─── Widget: Upcoming transports ─────────────────────────────────────────────

function UpcomingTransportsWidget({ stats }: { stats: Stats | null }) {
  const router = useRouter()

  if (!stats) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-muted/40 rounded-md" />
        ))}
      </div>
    )
  }

  const { grouped, total } = groupUpcomingByDay(stats.allRequests)

  if (total === 0) {
    return (
      <div className="text-center py-6">
        <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="text-sm text-muted-foreground">No approved transports found</p>
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

  // Show at most 2 day groups, 3 rides each
  const dayEntries = Object.entries(grouped).slice(0, 2)
  const shownCount = dayEntries.reduce((acc, [, rides]) => acc + Math.min(rides.length, 3), 0)
  const remaining = total - shownCount

  return (
    <div>
      {dayEntries.map(([dateKey, rides]) => (
        <div key={dateKey} className="mb-3 last:mb-0">
          {/* Day label */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              {formatDateLabel(dateKey)}
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground">
              {rides.length} ride{rides.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Ride rows */}
          {rides.slice(0, 3).map((r) => {
            // Use transport pickup if available, otherwise requested dropoff
            const displayTime = formatTimeFromISO(
              r.transport?.pickup_time ?? r.requested_dropoff_time
            )
            const dropoffTime = formatTimeFromISO(r.transport?.dropoff_time)
            const driver = r.transport?.account
              ? `${r.transport.account.first_name} ${r.transport.account.last_name}`
              : null
            const status = r.transport?.pickup_time
              ? rideStatus(r.transport.pickup_time)
              : null

            return (
              <div
                key={r.id}
                onClick={() => router.push("/dashboard/calendar")}
                className="flex items-stretch gap-3 py-2.5 border-b border-border last:border-b-0 cursor-pointer hover:opacity-70 transition-opacity group"
              >
                {/* Time */}
                <div className="flex flex-col items-end min-w-[38px] pt-0.5 flex-shrink-0">
                  <span className="text-[13px] font-medium leading-tight text-foreground">
                    {displayTime.replace(" AM", "").replace(" PM", "")}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {displayTime.includes("AM") ? "AM" : "PM"}
                  </span>
                </div>

                {/* Vertical rule */}
                <div className="w-px bg-border flex-shrink-0 my-0.5 rounded-full group-hover:bg-primary/30 transition-colors" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate text-foreground">
                    {r.first_name} {r.last_name}
                  </p>
                  {r.destination_address && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <p className="text-[11px] text-muted-foreground truncate">
                        {r.destination_address}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-0.5">
                    {driver ? (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">{driver}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-yellow-600 font-medium">No driver</span>
                    )}
                    {r.transport?.vehicle && (
                      <div className="flex items-center gap-1">
                        <Car className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">
                          {r.transport.vehicle}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right */}
                <div className="flex flex-col items-end justify-between flex-shrink-0 gap-1">
                  {dropoffTime && (
                    <span className="text-[10px] text-muted-foreground">→ {dropoffTime}</span>
                  )}
                  {status?.label && (
                    <span className={`text-[10px] flex items-center gap-1 ${status.textClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass} flex-shrink-0`} />
                      {status.label}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {remaining > 0 && (
        <button
          className="text-xs text-primary mt-1 flex items-center gap-1 hover:opacity-70 transition-opacity"
          onClick={() => router.push("/dashboard/calendar")}
        >
          +{remaining} more <ChevronRight className="h-3 w-3" />
        </button>
      )}
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
        <div
          key={r.id}
          className="py-2.5 flex items-center justify-between cursor-pointer hover:opacity-70 transition-opacity"
          onClick={() => router.push("/dashboard/review")}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor(r.approved)}`} />
            <div>
              <p className="text-sm font-medium leading-tight">
                {r.first_name} {r.last_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {timeSince(r.requested_dropoff_time)}
              </p>
            </div>
          </div>
          <StatusBadge status={r.approved} />
        </div>
      ))}
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

// ─── Widget: Quick actions ────────────────────────────────────────────────────

function QuickActionsWidget({ role }: { role: number }) {
  const router = useRouter()

  const actions: { label: string; href: string }[] =
    role === ROLE.REVIEWER
      ? [
          { label: "Open review queue", href: "/dashboard/review" },
          { label: "Settings",          href: "/settings"          },
        ]
      : role === ROLE.TRANSPORTER
      ? [{ label: "Settings", href: "/settings" }]
      : [
          { label: "+ Add transport",    href: "/dashboard/calendar" },
          { label: "Schedule pending",   href: "/dashboard/calendar" },
          { label: "Drivers list",       href: "/dashboard/drivers"  },
          { label: "This week's rides",  href: "/dashboard/calendar" },
        ]

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Button
          key={a.label}
          variant="outline"
          size="sm"
          className="rounded-full text-xs h-7"
          onClick={() => router.push(a.href)}
        >
          {a.label}
        </Button>
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

        {/* ── Row 1: Stats · Nav · Notifications ──────────────────────────
            Always exactly 3 columns on lg. Each widget gets one slot with
            no col-span trickery so nothing can go missing.                 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {isDriver    ? <><Calendar className="h-4 w-4" />    My rides</>
                : isReviewer  ? <><Clock className="h-4 w-4" />      Review queue</>
                :               <><AlertCircle className="h-4 w-4" /> Request overview</>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isDriver
                ? <MyRidesWidget stats={stats} />
                : <StatsWidget stats={stats} role={role} />}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ChevronRight className="h-4 w-4" /> Navigate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NavWidget stats={stats} role={role} />
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

        {/* ── Row 2: Upcoming transports (2/3) · This week (1/3) ──────────
            Isolated grid — only these two cards live here so the          
            lg:col-span-2 is always unambiguous.                           */}
        {(isAdmin || isTC) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <Card className="hover:shadow-md transition-shadow lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Upcoming transports
                  </span>
                  <button
                    className="text-xs text-primary font-normal hover:opacity-70 transition-opacity"
                    onClick={() => router.push("/dashboard/calendar")}
                  >
                    View all →
                  </button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingTransportsWidget stats={stats} />
              </CardContent>
            </Card>

            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push("/dashboard/calendar")}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" /> This week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <WeekWidget stats={stats} />
              </CardContent>
            </Card>

          </div>
        )}

        {/* ── Row 3: Recent requests (2/3) · Quick actions (1/3) ──────────
            Admin and Reviewer both get this row. Quick actions sits in    
            the third column alongside recent requests.                    */}
        {(isAdmin || isReviewer) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <Card className="hover:shadow-md transition-shadow lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" /> Recent requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecentWidget stats={stats} />
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4" /> Quick actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickActionsWidget role={role} />
              </CardContent>
            </Card>

          </div>
        )}

        {/* ── Quick actions standalone ─────────────────────────────────────
            TC and Driver don't get a Recent requests row, so Quick        
            actions gets its own card below.                               */}
        {!isAdmin && !isReviewer && (
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4" /> Quick actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuickActionsWidget role={role} />
            </CardContent>
          </Card>
        )}

      </section>
    </DashboardLayout>
  )
}
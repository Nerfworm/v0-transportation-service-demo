"use client"

import { useState } from "react"
import { Bus, ChevronLeft, ChevronRight, User, LogOut, Calendar, Users, Settings, HelpCircle, Home as HomeIcon, Menu } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const HOURS = ["1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM"]

interface CalendarEvent {
  id: string
  title: string
  day: number
  hour: number
  driver?: string
}

const sampleEvents: CalendarEvent[] = [
  { id: "1", title: "Transport", day: 0, hour: 0, driver: "John" },
  { id: "2", title: "Delivery", day: 0, hour: 1, driver: "Jane" },
]

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 23))
  const [filterDriver, setFilterDriver] = useState("all")
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    router.push("/")
  }

  const getWeekDates = () => {
    const dates = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates()

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
    <main className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(180deg, #eaf1fb 0%, #142850 100%)',
      minHeight: '100vh',
    }}>
      {/* Top Task Bar */}
      <header className="w-full bg-[#142850] py-3 px-6 flex items-center justify-between shadow-md">
        {/* Left: Logo Placeholder */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-2xl select-none">
            LOGO
          </div>
          {/* Navigation Buttons */}
          <nav className="flex items-center gap-3 ml-2">
            <Link href="/Home">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold" style={{ borderRadius: '2rem' }}>
                <HomeIcon className="mr-2 w-6 h-6" /> Home
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold" style={{ borderRadius: '2rem' }}>
                <Calendar className="mr-2 w-6 h-6" /> Calendar
              </Button>
            </Link>
            <Link href="/dashboard/drivers">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold" style={{ borderRadius: '2rem' }}>
                <Users className="mr-2 w-6 h-6" /> Drivers
              </Button>
            </Link>
          </nav>
        </div>
        {/* Right: Menu Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-full text-white hover:bg-white/10 px-6 py-3 transition-transform"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{ transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
          >
            <Menu className="w-10 h-10" />
          </Button>
        </div>
      </header>

      {/* Side Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setMenuOpen(false)} />
      )}

      {/* Side Menu */}
      <div
        className="fixed top-0 right-0 h-full w-64 bg-[#142850] shadow-lg z-50 flex flex-col p-6 transition-transform"
        style={{
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="space-y-4">
          <Button
            className="w-full justify-start rounded-lg px-4 py-3 text-lg font-semibold"
            onClick={() => {
              router.push('/settings')
              setMenuOpen(false)
            }}
          >
            <Settings className="mr-2 w-5 h-5" /> Settings
          </Button>
          <Button
            className="w-full justify-start rounded-lg px-4 py-3 text-lg font-semibold"
            onClick={() => {
              router.push('/profile')
              setMenuOpen(false)
            }}
          >
            <User className="mr-2 w-5 h-5" /> Profile
          </Button>
          <Button
            className="w-full justify-start rounded-lg px-4 py-3 text-lg font-semibold"
            onClick={() => {
              router.push('/help')
              setMenuOpen(false)
            }}
          >
            <HelpCircle className="mr-2 w-5 h-5" /> Help
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Coordinator Calendar</h1>

        <div className="bg-card rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
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

          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
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
                    return (
                      <div
                        key={dayIndex}
                        className="p-1 min-h-16 border-r border-border last:border-r-0 hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        {event && (
                          <div className="bg-accent text-accent-foreground text-xs p-1 rounded">
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
        </div>
      </div>
    </main>
  )
}

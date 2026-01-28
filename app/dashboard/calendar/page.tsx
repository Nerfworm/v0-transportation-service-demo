import { Bus, ChevronLeft, ChevronRight, LogOut } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCurrentUser, logout } from "@/app/actions/auth"
import { getRequests } from "@/app/actions/requests"
import { getDrivers } from "@/app/actions/drivers"
import CalendarView from "./calendar-view"

export default async function CalendarPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/staff-login")
  }

  const [requests, drivers] = await Promise.all([
    getRequests("Approved"),
    getDrivers(),
  ])

  const handleLogout = async () => {
    "use server"
    await logout()
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-muted">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Bus className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground hidden md:inline">Transportation Service</span>
          </div>

          <nav className="flex items-center gap-1 md:gap-2">
            <Link href="/dashboard">
              <Button variant="ghost" className="gap-2">
                <span>Home</span>
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button variant="secondary" className="gap-2">
                <span>Calendar</span>
              </Button>
            </Link>
            <Link href="/dashboard/drivers">
              <Button variant="ghost" className="gap-2">
                <span>Drivers</span>
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <form action={handleLogout}>
              <Button variant="ghost" size="icon" type="submit">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Coordinator Calendar</h1>
        <CalendarView requests={requests} drivers={drivers} />
      </div>
    </main>
  )
}

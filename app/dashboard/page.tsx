import { Bus, Calendar, Users, User, LogOut, ClipboardList } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, logout } from "@/app/actions/auth"
import { getRequests } from "@/app/actions/requests"
import { getDrivers } from "@/app/actions/drivers"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/staff-login")
  }

  const [pendingRequests, drivers] = await Promise.all([
    getRequests("Pending"),
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
              <Button variant="secondary" className="gap-2">
                <span>Home</span>
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button variant="ghost" className="gap-2">
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
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>{user.first_name} {user.last_name}</span>
            </div>
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
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome back, {user.first_name}!
        </h1>
        <p className="text-muted-foreground mb-6">Here's an overview of your transportation service.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard/calendar">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <Calendar className="h-16 w-16 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">View and manage transportation schedules</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/drivers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Drivers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-lg flex flex-col items-center justify-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-2xl font-bold text-foreground">{drivers.length}</span>
                  <span className="text-sm text-muted-foreground">Staff Members</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Manage driver assignments and availability</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/requests">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Pending Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded-lg flex flex-col items-center justify-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-2xl font-bold text-foreground">{pendingRequests.length}</span>
                  <span className="text-sm text-muted-foreground">Awaiting Review</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4">Review and approve transportation requests</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  )
}

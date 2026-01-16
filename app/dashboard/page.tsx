"use client"

import { Bus, Calendar, Users, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
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
            <Avatar>
              <AvatarFallback className="bg-muted-foreground text-muted">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-muted-foreground text-muted">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-muted-foreground text-muted">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Home</h1>

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
                <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                  <Users className="h-16 w-16 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">Manage driver assignments and availability</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  )
}

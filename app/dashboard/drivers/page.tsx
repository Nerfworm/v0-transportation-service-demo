"use client"

import { Bus, User, LogOut, Phone, Mail, Car } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const drivers = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@transport.com",
    phone: "+1 (555) 123-4567",
    status: "available",
    vehicle: "Van #101",
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "jane.doe@transport.com",
    phone: "+1 (555) 234-5678",
    status: "on-route",
    vehicle: "Bus #202",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@transport.com",
    phone: "+1 (555) 345-6789",
    status: "off-duty",
    vehicle: "Van #103",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.williams@transport.com",
    phone: "+1 (555) 456-7890",
    status: "available",
    vehicle: "Bus #204",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800"
    case "on-route":
      return "bg-blue-100 text-blue-800"
    case "off-duty":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function DriversPage() {
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
              <Button variant="ghost" className="gap-2">
                <span>Home</span>
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button variant="ghost" className="gap-2">
                <span>Calendar</span>
              </Button>
            </Link>
            <Link href="/dashboard/drivers">
              <Button variant="secondary" className="gap-2">
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Drivers</h1>
          <Button>Add Driver</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drivers.map((driver) => (
            <Card key={driver.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {driver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{driver.name}</CardTitle>
                  <Badge className={`mt-1 ${getStatusColor(driver.status)}`}>{driver.status.replace("-", " ")}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{driver.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{driver.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Car className="h-4 w-4" />
                  <span>{driver.vehicle}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}

"use client"

import { useState } from "react"
import { Bus, User, LogOut, Phone, Mail, Car, Calendar, Users, Settings, HelpCircle, Home as HomeIcon, Menu } from "lucide-react"
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
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    router.push("/")
  }

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
      </div>
    </main>
  )
}

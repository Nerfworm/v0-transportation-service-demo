import { Bus, LogOut, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, logout } from "@/app/actions/auth"
import { getStaffMembers } from "@/app/actions/drivers"

export default async function DriversPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/staff-login")
  }

  const staff = await getStaffMembers()

  const handleLogout = async () => {
    "use server"
    await logout()
    redirect("/")
  }

  const getRoleBadgeColor = (roleName: string | undefined) => {
    switch (roleName?.toLowerCase()) {
      case "driver":
        return "bg-blue-100 text-blue-800"
      case "coordinator":
        return "bg-purple-100 text-purple-800"
      case "admin":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Staff & Drivers</h1>
          <Link href="/register">
            <Button>Add Staff Member</Button>
          </Link>
        </div>

        {staff.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No staff members found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {member.first_name?.[0]}{member.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {member.first_name} {member.last_name}
                    </CardTitle>
                    <Badge className={`mt-1 ${getRoleBadgeColor((member.role as { name?: string })?.name)}`}>
                      {(member.role as { name?: string })?.name || "Staff"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {member.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{member.email}</span>
                    </div>
                  )}
                  {member.phone_number && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{member.phone_number}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

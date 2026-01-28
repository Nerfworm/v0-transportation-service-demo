import { Bus, LogOut, Check, X, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser, logout } from "@/app/actions/auth"
import { getRequests, updateRequestStatus } from "@/app/actions/requests"

export default async function RequestsPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/staff-login")
  }

  const requests = await getRequests()

  const handleLogout = async () => {
    "use server"
    await logout()
    redirect("/")
  }

  const approveRequest = async (formData: FormData) => {
    "use server"
    const requestId = Number(formData.get("requestId"))
    await updateRequestStatus(requestId, "Approved")
    revalidatePath("/dashboard/requests")
  }

  const denyRequest = async (formData: FormData) => {
    "use server"
    const requestId = Number(formData.get("requestId"))
    await updateRequestStatus(requestId, "Denied")
    revalidatePath("/dashboard/requests")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "Denied":
        return <Badge className="bg-red-100 text-red-800">Denied</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    })
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
        <h1 className="text-2xl font-bold text-foreground mb-6">Transportation Requests</h1>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No requests found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {request.first_name} {request.last_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {request.email || "No email"} {request.phone_number ? `| ${request.phone_number}` : ""}
                    </p>
                  </div>
                  {getStatusBadge(request.approved)}
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-600 mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">From</p>
                          <p className="text-sm">{request.source_address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-red-600 mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">To</p>
                          <p className="text-sm">{request.destination_address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Arrival Time</p>
                          <p className="text-sm">{formatDate(request.arrival_time)}</p>
                        </div>
                      </div>
                      {request.comments && (
                        <div>
                          <p className="text-xs text-muted-foreground">Comments</p>
                          <p className="text-sm">{request.comments}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.approved === "Pending" && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                      <form action={approveRequest}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <Button type="submit" size="sm" className="gap-1">
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                      </form>
                      <form action={denyRequest}>
                        <input type="hidden" name="requestId" value={request.id} />
                        <Button type="submit" size="sm" variant="destructive" className="gap-1">
                          <X className="h-4 w-4" />
                          Deny
                        </Button>
                      </form>
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

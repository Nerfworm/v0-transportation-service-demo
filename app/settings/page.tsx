"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <DashboardLayout
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      onSettingsClick={() => {
        router.push('/settings');
        setMenuOpen(false);
      }}
      onProfileClick={() => {
        router.push('/profile');
        setMenuOpen(false);
      }}
      onHelpClick={() => {
        router.push('/help');
        setMenuOpen(false);
      }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>General</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Placeholder for general settings options such as notifications, theme, and account details.
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Account-specific settings will appear here (e.g., change password, manage email).
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

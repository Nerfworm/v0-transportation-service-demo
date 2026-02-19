"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import * as Tabs from '@radix-ui/react-tabs'

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

        <Tabs.Root defaultValue="general" orientation="vertical" className="w-full">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex">
              <Tabs.List className="flex flex-col space-y-2 border-r border-border pr-4 w-40">
                <Tabs.Trigger
                  value="account"
                  className="text-sm font-medium text-foreground text-left px-3 py-2 hover:bg-accent rounded-md data-[state=active]:bg-card data-[state=active]:border-l-4 data-[state=active]:border-primary"
                >
                  Account
                </Tabs.Trigger>
                <Tabs.Trigger
                  value="general"
                  className="text-sm font-medium text-foreground text-left px-3 py-2 hover:bg-accent rounded-md data-[state=active]:bg-card data-[state=active]:border-l-4 data-[state=active]:border-primary"
                >
                  General
                </Tabs.Trigger>
              </Tabs.List>

              <div className="flex-1 p-4">
                <Tabs.Content value="general">
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Placeholder for general settings options such as notifications, theme, and account details.
                    </p>
                  </CardContent>
                </Tabs.Content>

                <Tabs.Content value="account">
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Account-specific settings will appear here (e.g., change password, manage email).
                    </p>
                  </CardContent>
                </Tabs.Content>
              </div>
            </div>
          </Card>
        </Tabs.Root>
      </div>
    </DashboardLayout>
  )
}

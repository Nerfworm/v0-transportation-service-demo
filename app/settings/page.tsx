"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as Tabs from '@radix-ui/react-tabs'

type AccountInfo = {
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  newPassword: string
  confirmNewPassword: string
  requestedRole: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    firstName: "Alex",
    lastName: "Morgan",
    username: "amorgan",
    email: "alex.morgan@example.com",
    phone: "+1 (555) 123-4567",
    newPassword: "********",
    confirmNewPassword: "********",
    requestedRole: "coordinator",
  })
  const [editableFields, setEditableFields] = useState<Partial<Record<keyof AccountInfo, boolean>>>({})
  const [saveMessage, setSaveMessage] = useState("")

  const accountFields: Array<{ key: keyof AccountInfo; label: string; type?: string }> = [
    { key: "firstName", label: "First name" },
    { key: "lastName", label: "Last name" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "newPassword", label: "New password", type: "password" },
    { key: "confirmNewPassword", label: "Confirm new password", type: "password" },
    { key: "requestedRole", label: "Requested role" },
  ]

  const toggleFieldEdit = (field: keyof AccountInfo) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }))
    setSaveMessage("")
  }

  const handleFieldChange = (field: keyof AccountInfo, value: string) => {
    setAccountInfo((prev) => ({ ...prev, [field]: value }))
    setSaveMessage("")
  }

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault()
    setEditableFields({})
    setSaveMessage("Changes saved locally. You can wire backend save next.")
  }

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

        <Tabs.Root defaultValue="account" orientation="vertical" className="w-full">
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
                <Tabs.Content value="account">
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Account information
                    </p>
                    <form onSubmit={handleSaveAll} className="space-y-4">
                      {accountFields.map((field, index) => (
                        <div key={field.key}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="w-full max-w-md space-y-2">
                              <Label htmlFor={field.key}>{field.label}</Label>

                              {editableFields[field.key] ? (
                                field.key === "requestedRole" ? (
                                  <Select
                                    value={accountInfo.requestedRole}
                                    onValueChange={(value) => handleFieldChange("requestedRole", value)}
                                  >
                                    <SelectTrigger id="requestedRole">
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="driver">Driver</SelectItem>
                                      <SelectItem value="coordinator">Coordinator</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Input
                                    id={field.key}
                                    type={field.type ?? "text"}
                                    value={accountInfo[field.key]}
                                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                  />
                                )
                              ) : (
                                <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted/20 text-sm text-foreground">
                                  {field.type === "password" ? "••••••••" : accountInfo[field.key]}
                                </div>
                              )}
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              className="mt-7"
                              onClick={() => toggleFieldEdit(field.key)}
                            >
                              {editableFields[field.key] ? "Done" : "Edit"}
                            </Button>
                          </div>

                          {index < accountFields.length - 1 && (
                            <div className="border-t border-border my-4" />
                          )}
                        </div>
                      ))}

                      <div className="flex justify-center pt-2">
                        <Button type="submit" className="px-8">
                          Save Changes
                        </Button>
                      </div>

                      {saveMessage && (
                        <p className="text-sm text-muted-foreground text-center">{saveMessage}</p>
                      )}
                    </form>
                  </CardContent>
                </Tabs.Content>

                <Tabs.Content value="general">
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Placeholder for general settings options such as notifications, theme, and account details.
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

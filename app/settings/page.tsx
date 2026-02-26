"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as Tabs from '@radix-ui/react-tabs'

export default function SettingsPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [username, setUsername] = useState("")
  const [firstNameInput, setFirstNameInput] = useState("")
  const [lastNameInput, setLastNameInput] = useState("")
  const [requestedRole, setRequestedRole] = useState("")

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
                      Update your account information below.
                    </p>
                    {/* name change section */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="firstNameChange">First name</Label>
                        <Input
                          id="firstNameChange"
                          placeholder="Enter first name"
                          value={firstNameInput}
                          onChange={(e) => setFirstNameInput(e.target.value)}
                          className="w-[40%]"
                        />
                      </div>
                      <div className="flex items-center">
                        <Button type="submit" className="mt-2">
                          Submit
                        </Button>
                      </div>
                    </form>

                    {/* divider */}
                    <div className="border-t border-border my-6" />

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="lastNameChange">Last name</Label>
                        <Input
                          id="lastNameChange"
                          placeholder="Enter last name"
                          value={lastNameInput}
                          onChange={(e) => setLastNameInput(e.target.value)}
                          className="w-[40%]"
                        />
                      </div>
                      <div className="flex items-center">
                        <Button type="submit" className="mt-2">
                          Submit
                        </Button>
                      </div>
                    </form>

                    {/* divider */}
                    <div className="border-t border-border my-6" />

                    {/* username change section */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="usernameChange">Change username</Label>
                        <Input
                          id="usernameChange"
                          placeholder="Enter new username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-[40%]"
                        />
                      </div>
                      <div className="flex items-center">
                        <Button type="submit" className="mt-2">
                          Submit
                        </Button>
                      </div>
                    </form>

                    {/* divider */}
                    <div className="border-t border-border my-6" />

                    {/* email change section */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="newEmail">Change email address</Label>
                        <Input
                          id="newEmail"
                          type="email"
                          placeholder="Enter new email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-[40%]"
                        />
                      </div>
                      <div className="flex items-center">
                        <Button type="submit" className="mt-2">
                          Submit
                        </Button>
                      </div>
                    </form>

                    {/* divider */}
                    <div className="border-t border-border my-6" />

                    {/* phone change section */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="phone">Change phone number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter new phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-[40%]"
                        />
                      </div>
                      <div className="flex items-center">
                        <Button type="submit" className="mt-2">
                          Submit
                        </Button>
                      </div>
                    </form>

                    {/* divider */}
                    <div className="border-t border-border my-6" />

                    {/* password change section */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                      className="space-y-4 mt-6"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-[40%]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          placeholder="Confirm password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-[40%]"
                        />
                      </div>
                      <div className="flex items-center">
                        <Button type="submit" className="mt-2">
                          Submit
                        </Button>
                      </div>
                    </form>

                    {/* divider */}
                    <div className="border-t border-border my-6" />

                    {/* role request section */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="roleRequest">Request role change</Label>
                        <Select
                          value={requestedRole}
                          onValueChange={(val) => setRequestedRole(val)}
                        >
                          <SelectTrigger id="roleRequest" className="w-[40%]">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="driver">Driver</SelectItem>
                            <SelectItem value="coordinator">Coordinator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center">
                        <Button type="submit" className="mt-2">
                          Submit
                        </Button>
                      </div>
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

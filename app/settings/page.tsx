"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/DashboardLayout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import * as Tabs from '@radix-ui/react-tabs'

const SUPABASE_FUNCTIONS_URL = "https://svvguxhkhesrlzmydghw.supabase.co/functions/v1"

type AccountInfo = {
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  newPassword: string
  confirmNewPassword: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")
  const [editableFields, setEditableFields] = useState<Partial<Record<keyof AccountInfo, boolean>>>({})
  const [saveMessage, setSaveMessage] = useState("")
  const [saveError, setSaveError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [passwordRequirementsError, setPasswordRequirementsError] = useState("")
  const [passwordMatchError, setPasswordMatchError] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  useEffect(() => {
    async function fetchAccount() {
      try {
        const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/my-account`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          credentials: "include",
        })
        const data = await res.json()
        if (!res.ok) {
          setFetchError(data.error || "Failed to load account data")
          return
        }
        setAccountInfo((prev) => ({
          ...prev,
          firstName: data.first_name ?? "",
          lastName: data.last_name ?? "",
          username: data.username ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        }))
      } catch {
        setFetchError("Failed to load account data")
      } finally {
        setLoading(false)
      }
    }
    fetchAccount()
  }, [])

  const accountFields: Array<{ key: keyof AccountInfo; label: string; type?: string }> = [
    { key: "firstName", label: "First name" },
    { key: "lastName", label: "Last name" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "newPassword", label: "New password", type: "password" },
    { key: "confirmNewPassword", label: "Confirm new password", type: "password" },
  ]

  function validatePassword(password: string) {
    const minLength = /.{8,}/
    const upper = /[A-Z]/
    const lower = /[a-z]/
    const digit = /[0-9]/
    const symbol = /[^A-Za-z0-9]/
    return (
      minLength.test(password) &&
      upper.test(password) &&
      lower.test(password) &&
      digit.test(password) &&
      symbol.test(password)
    )
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  function formatPhoneNumber(value: string) {
    let digits = value.replace(/\D/g, "")
    if (digits.startsWith("1")) digits = digits.slice(1)
    digits = digits.slice(0, 10)
    let formatted = "+1 "
    if (digits.length > 0) {
      formatted += "(" + digits.slice(0, 3)
    }
    if (digits.length >= 4) {
      formatted += ") " + digits.slice(3, 6)
    }
    if (digits.length >= 7) {
      formatted += "-" + digits.slice(6, 10)
    }
    return formatted.trim()
  }

  const toggleFieldEdit = (field: keyof AccountInfo) => {
    setEditableFields((prev) => ({ ...prev, [field]: !prev[field] }))
    setSaveMessage("")
    setSaveError("")
  }

  const handleFieldChange = (field: keyof AccountInfo, value: string) => {
    const nextValue = field === "phone" ? formatPhoneNumber(value) : value
    setAccountInfo((prev) => ({ ...prev, [field]: nextValue }))
    setSaveMessage("")
    setSaveError("")
    if (field === "email") {
      setEmailError("")
    }
    if (field === "phone") {
      setPhoneError("")
    }
    if (field === "newPassword" || field === "confirmNewPassword") {
      setPasswordRequirementsError("")
      setPasswordMatchError("")
    }
  }

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault()

    setEmailError("")
    setPhoneError("")
    setPasswordRequirementsError("")
    setPasswordMatchError("")
    setSaveMessage("")
    setSaveError("")

    if (!validateEmail(accountInfo.email)) {
      setEmailError("Enter a valid email address")
      return
    }

    const phoneDigits = accountInfo.phone.replace(/\D/g, "")
    if (phoneDigits.length !== 10 && !(phoneDigits.length === 11 && phoneDigits.startsWith("1"))) {
      setPhoneError("Enter a 10-digit phone number")
      return
    }

    const isUpdatingPassword = accountInfo.newPassword.length > 0 || accountInfo.confirmNewPassword.length > 0
    if (isUpdatingPassword && !validatePassword(accountInfo.newPassword)) {
      setPasswordRequirementsError(
        "Password must be at least 8 characters, include upper and lower case letters, a digit, and a symbol."
      )
      return
    }

    if (isUpdatingPassword && accountInfo.newPassword !== accountInfo.confirmNewPassword) {
      setPasswordMatchError("Passwords don't match")
      return
    }

    try {
      const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/update-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        credentials: "include",
        body: JSON.stringify({
          firstName: accountInfo.firstName,
          lastName: accountInfo.lastName,
          username: accountInfo.username,
          email: accountInfo.email,
          phone: accountInfo.phone,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error || "Failed to save changes")
        return
      }
      if (data.account) {
        setAccountInfo((prev) => ({
          ...prev,
          firstName: data.account.first_name ?? prev.firstName,
          lastName: data.account.last_name ?? prev.lastName,
          username: data.account.username ?? prev.username,
          phone: data.account.phone ?? prev.phone,
        }))
      }
      setEditableFields({})
      setSaveMessage("Changes saved.")
    } catch {
      setSaveError("Failed to save changes. Please try again.")
    }
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/staff-login"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground">Loading account information...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {fetchError && (
          <p className="text-sm text-red-500 mb-4">{fetchError}</p>
        )}
        {/* <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1> */}

        <Tabs.Root defaultValue="account" orientation="vertical" className="w-full">
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex">
              <Tabs.List className="flex flex-col justify-between border-r border-border pr-4 py-2 w-48">
                <div className="space-y-2">
                  <Tabs.Trigger
                    value="account"
                    className="w-full text-sm font-medium text-foreground text-left px-3 py-2 hover:bg-accent rounded-md data-[state=active]:bg-card data-[state=active]:border-l-4 data-[state=active]:border-primary"
                  >
                    Account
                  </Tabs.Trigger>
                  {/* <Tabs.Trigger
                    value="general"
                    className="w-full text-sm font-medium text-foreground text-left px-3 py-2 hover:bg-accent rounded-md data-[state=active]:bg-card data-[state=active]:border-l-4 data-[state=active]:border-primary"
                  >
                    General
                  </Tabs.Trigger> */}
                </div>

                <button
                  type="button"
                  className="w-full px-3 py-2 text-sm font-medium flex items-center cursor-pointer transition-colors hover:bg-red-100 text-red-600 rounded-md"
                  onClick={handleLogout}
                >
                  <svg
                    className="mr-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                    />
                  </svg>
                  Log out
                </button>
              </Tabs.List>

              <div className="flex-1 p-4">
                <Tabs.Content value="account">
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Change account information
                    </p>
                    <form onSubmit={handleSaveAll} className="space-y-4">
                      {accountFields.map((field, index) => (
                        <div key={field.key}>
                          <div className="flex items-end gap-3">
                            <div className="flex-1 max-w-md space-y-2">
                              <Label htmlFor={field.key}>{field.label}</Label>

                              {editableFields[field.key] ? (
                                field.type === "password" ? (
                                  <div className="relative">
                                    <Input
                                      id={field.key}
                                      type={
                                        field.key === "newPassword"
                                          ? (showNewPassword ? "text" : "password")
                                          : (showConfirmNewPassword ? "text" : "password")
                                      }
                                      className="pr-10"
                                      value={accountInfo[field.key]}
                                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-sm"
                                      className="absolute right-1 top-1/2 -translate-y-1/2"
                                      aria-label={
                                        field.key === "newPassword"
                                          ? (showNewPassword ? "Hide password" : "Show password")
                                          : (showConfirmNewPassword ? "Hide password" : "Show password")
                                      }
                                      onClick={() => {
                                        if (field.key === "newPassword") {
                                          setShowNewPassword((prev) => !prev)
                                        } else {
                                          setShowConfirmNewPassword((prev) => !prev)
                                        }
                                      }}
                                    >
                                      {field.key === "newPassword"
                                        ? (showNewPassword ? <EyeOff /> : <Eye />)
                                        : (showConfirmNewPassword ? <EyeOff /> : <Eye />)}
                                    </Button>
                                  </div>
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
                                  {field.type === "password" ? "•".repeat(accountInfo[field.key].length) : accountInfo[field.key]}
                                </div>
                              )}

                              {field.key === "email" && emailError && (
                                <p className="text-xs text-red-500">{emailError}</p>
                              )}

                              {field.key === "phone" && editableFields.phone && accountInfo.phone.replace(/\D/g, "").length !== 10 && !phoneError && (
                                <p className="text-xs text-gray-500">Enter a 10-digit phone number</p>
                              )}

                              {field.key === "phone" && phoneError && (
                                <p className="text-xs text-red-500">{phoneError}</p>
                              )}
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              className="h-9 shrink-0"
                              onClick={() => toggleFieldEdit(field.key)}
                            >
                              {editableFields[field.key] ? "Done" : "Edit"}
                            </Button>
                          </div>

                          {field.key === "newPassword" && passwordRequirementsError && (
                            <p className="text-xs text-red-500 mt-2">{passwordRequirementsError}</p>
                          )}

                          {field.key === "confirmNewPassword" && passwordMatchError && (
                            <p className="text-sm text-red-500 mt-2">{passwordMatchError}</p>
                          )}

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
                        <p className="text-sm text-green-600 text-center">{saveMessage}</p>
                      )}

                      {saveError && (
                        <p className="text-sm text-red-500 text-center">{saveError}</p>
                      )}
                    </form>
                  </CardContent>
                </Tabs.Content>

                {/* <Tabs.Content value="general">
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Placeholder for general settings options such as notifications, theme, and account details.
                    </p>
                  </CardContent>
                </Tabs.Content> */}
              </div>
            </div>
          </Card>
        </Tabs.Root>
      </div>
    </DashboardLayout>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bus, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { register, getRoles } from "@/app/actions/auth"

type Role = {
  id: number
  name: string
  description: string | null
}

export default function RegisterPage() {
  const router = useRouter()
  const [roles, setRoles] = useState<Role[]>([])
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    role: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRoles().then(setRoles)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.mobileNumber,
      role: formData.role,
      username: formData.username,
      password: formData.password,
    })

    setIsLoading(false)

    if (result.success) {
      router.push("/staff-login?registered=true")
    } else {
      setError(result.error || "Registration failed")
    }
  }

  return (
    <main className="min-h-screen bg-muted p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        <Link
          href="/staff-login"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>

        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary p-2 rounded-lg">
              <Bus className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Transportation Service</h1>
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-6">Registration</h2>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="Mobile number"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role / Position</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.length > 0 ? (
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="Driver">Driver</SelectItem>
                      <SelectItem value="Coordinator">Coordinator</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                "Create new account"
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}

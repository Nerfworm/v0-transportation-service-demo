// ...existing code...
"use client"

import type React from "react"

import { useState } from "react"
import { Bus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    username: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState("");
  // Removed passwordRequirementsError state

  function validatePassword(password: string) {
    // At least 8 chars, 1 upper, 1 lower, 1 digit, 1 symbol
    const minLength = /.{8,}/;
    const upper = /[A-Z]/;
    const lower = /[a-z]/;
    const digit = /[0-9]/;
    const symbol = /[^A-Za-z0-9]/;
    return (
      minLength.test(password) &&
      upper.test(password) &&
      lower.test(password) &&
      digit.test(password) &&
      symbol.test(password)
    );
  }
  // Phone formatting function
  function formatPhoneNumber(value: string) {
    let digits = value.replace(/\D/g, "");
    if (digits.startsWith("1")) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    let formatted = "+1 ";
    if (digits.length > 0) {
      formatted += "(" + digits.slice(0, 3);
    }
    if (digits.length >= 4) {
      formatted += ") " + digits.slice(3, 6);
    }
    if (digits.length >= 7) {
      formatted += "-" + digits.slice(6, 10);
    }
    return formatted.trim();
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPasswordMatchError("");

    setLoading(true);

    // Password requirements
    if (!validatePassword(formData.password)) {
      setLoading(false);
      return;
    }

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatchError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      // Ensure phone is submitted as +1XXXXXXXXXX (E.164)
      const digits = formData.phone.replace(/\D/g, "").slice(-10);
      const phoneE164 = digits.length === 10 ? `+1${digits}` : formData.phone;
      const submitData = { ...formData, phone: phoneE164 };
      const res = await fetch(
        "https://svvguxhkhesrlzmydghw.supabase.co/functions/v1/register-account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(submitData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Redirect to staff-login after successful registration
      router.push("/staff-login");
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    }

    setLoading(false);
  };


  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8" style={{ background: 'linear-gradient(180deg, #eaf1fb 0%, #142850 100%)', minHeight: '100vh' }}>
      <div className="w-full max-w-lg">
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

          {error && <div className="text-red-500 mb-4">{error}</div>}
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
                value={formData.phone}
                onChange={handlePhoneChange}
                maxLength={17}
                required
              />
              {formData.phone.replace(/\D/g, '').length === 10 ? null : (
                <div className="text-xs text-gray-500">Enter a 10-digit phone number</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role / Position</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
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
              {!validatePassword(formData.password) && formData.password.length > 0 && (
                <div className="text-xs text-red-500 mt-1">
                  Password must be at least 8 characters, include upper and lower case letters, a digit, and a symbol.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  setPasswordMatchError("");
                }}
                required
              />
              {passwordMatchError && (
                <div className="text-red-500 text-sm mt-1">{passwordMatchError}</div>
              )}
            </div>

            <Button type="submit" className="w-full mt-6">
              {loading ? "Creating..." : "Create new account"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}


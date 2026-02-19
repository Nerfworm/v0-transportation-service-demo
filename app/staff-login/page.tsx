"use client"

import type React from "react"

import { useState } from "react"
import { Bus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function StaffLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);

  try {
    const res = await fetch(
      "https://svvguxhkhesrlzmydghw.supabase.co/functions/v1/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(formData),
        credentials: "include" 
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Login failed");
      setLoading(false);
      return;
    }

    router.push("/dashboard/Home");
  } catch (err: any) {
    setError(err.message || "Unexpected error");
  }

  setLoading(false);
};
  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #eaf1fb 0%, #142850 100%)', minHeight: '100vh' }}>
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-card rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-primary p-3 rounded-lg">
              <Bus className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Transportation Service</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button type="submit" className="w-full py-2">
              Login
            </Button>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Create an Account</p>
            <Link href="/register">
              <Button variant="outline" className="w-full bg-transparent">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}


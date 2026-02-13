"use client"

import type React from "react"

import { useState } from "react"
import { Bus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ClientRequestPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    houseName: "",
    email: "",
    phone: "",
    sourceAddress: "",
    destinationAddress: "",
    arrivalTime: "",
    // amPm removed
    comments: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    const response = await fetch(
      "https://svvguxhkhesrlzmydghw.supabase.co/functions/v1/submit-request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          houseId: 7, // adjust if needed
          email: formData.email,
          phone: formData.phone,
          sourceAddress: formData.sourceAddress,
          destinationAddress: formData.destinationAddress,
          pickupTime: formData.arrivalTime,
          dropoffTime: "", // optional, set if you have it
          comments: formData.comments,
        }),
        credentials: "include", // important if function sets cookies
      }
    )

    const data = await response.json()

    if (!response.ok) {
      alert(data.error || "Request submission failed")
      return
    }

    alert("Request submitted successfully!")
    // optionally clear the form
    setFormData({
      firstName: "",
      lastName: "",
      houseName: "",
      email: "",
      phone: "",
      sourceAddress: "",
      destinationAddress: "",
      arrivalTime: "",
      // amPm removed
      comments: "",
    })
  } catch (err: any) {
    console.error(err)
    alert("Unexpected error: " + (err.message || err))
  }
}


  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8" style={{ background: 'linear-gradient(180deg, #eaf1fb 0%, #142850 100%)', minHeight: '100vh' }}>
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary p-2 rounded-lg">
              <Bus className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Client Request Forum</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseName">House Name</Label>
                <Select
                  value={formData.houseName}
                  onValueChange={(value) => setFormData({ ...formData, houseName: value })}
                >
                  <SelectTrigger id="houseName">
                    <SelectValue placeholder="Select House Name" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Options will be populated from the database in the future */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone # (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone # (optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sourceAddress">Source Address</Label>
                <Input
                  id="sourceAddress"
                  placeholder="Source Address"
                  value={formData.sourceAddress}
                  onChange={(e) => setFormData({ ...formData, sourceAddress: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinationAddress">Destination Address</Label>
                <Input
                  id="destinationAddress"
                  placeholder="Destination Address"
                  value={formData.destinationAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      destinationAddress: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1">
                <Label htmlFor="arrivalTime">Arrival Time</Label>
                <Input
                  id="arrivalTime"
                  type="time"
                  placeholder="Arrival Time"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  required
                />
              </div>
              {/* AM/PM dropdown removed */}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Additional comments or special requirements..."
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full md:w-auto px-8 py-2">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}

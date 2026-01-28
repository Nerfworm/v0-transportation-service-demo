"use client"

import type React from "react"
import { useState } from "react"
import { Bus, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { submitTransportRequest } from "@/app/actions/requests"

export default function ClientRequestPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    houseName: "",
    email: "",
    phone: "",
    sourceAddress: "",
    destinationAddress: "",
    arrivalDate: "",
    arrivalTime: "",
    comments: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Combine date and time for arrival_time
    const arrivalDateTime = formData.arrivalDate && formData.arrivalTime
      ? new Date(`${formData.arrivalDate}T${formData.arrivalTime}`).toISOString()
      : new Date().toISOString()

    const result = await submitTransportRequest({
      firstName: formData.firstName,
      lastName: formData.lastName,
      houseName: formData.houseName || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      sourceAddress: formData.sourceAddress,
      destinationAddress: formData.destinationAddress,
      arrivalTime: arrivalDateTime,
      comments: formData.comments || undefined,
    })

    setIsSubmitting(false)

    if (result.success) {
      setIsSuccess(true)
      setFormData({
        firstName: "",
        lastName: "",
        houseName: "",
        email: "",
        phone: "",
        sourceAddress: "",
        destinationAddress: "",
        arrivalDate: "",
        arrivalTime: "",
        comments: "",
      })
    } else {
      setError(result.error || "Failed to submit request")
    }
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-muted p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-xl shadow-lg p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Your transportation request has been submitted successfully. A coordinator will review it shortly.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setIsSuccess(false)}>Submit Another Request</Button>
              <Link href="/">
                <Button variant="outline" className="bg-transparent">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-muted p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
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

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

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
                <Input
                  id="houseName"
                  placeholder="House Name"
                  value={formData.houseName}
                  onChange={(e) => setFormData({ ...formData, houseName: e.target.value })}
                />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arrivalDate">Arrival Date</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Arrival Time</Label>
                <Input
                  id="arrivalTime"
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  required
                />
              </div>
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

            <Button type="submit" className="w-full md:w-auto px-8 py-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Bus, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { submitTransportRequest, getHouses, type House } from "@/app/actions/requests"

export default function ClientRequestPage() {
  const [houses, setHouses] = useState<House[]>([])
  const [isLoadingHouses, setIsLoadingHouses] = useState(true)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    houseId: "",
    email: "",
    phone: "",
    sourceAddress: "",
    destinationAddress: "",
    pickupDate: "",
    pickupTime: "",
    dropoffDate: "",
    dropoffTime: "",
    comments: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHouses() {
      const fetchedHouses = await getHouses()
      setHouses(fetchedHouses)
      setIsLoadingHouses(false)
    }
    loadHouses()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!formData.houseId) {
      setError("Please select a house")
      setIsSubmitting(false)
      return
    }

    // Combine date and time for pickup and dropoff
    const pickupDateTime = formData.pickupDate && formData.pickupTime
      ? new Date(`${formData.pickupDate}T${formData.pickupTime}`).toISOString()
      : new Date().toISOString()

    const dropoffDateTime = formData.dropoffDate && formData.dropoffTime
      ? new Date(`${formData.dropoffDate}T${formData.dropoffTime}`).toISOString()
      : new Date().toISOString()

    const result = await submitTransportRequest({
      firstName: formData.firstName,
      lastName: formData.lastName,
      houseId: parseInt(formData.houseId, 10),
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      sourceAddress: formData.sourceAddress,
      destinationAddress: formData.destinationAddress,
      pickupTime: pickupDateTime,
      dropoffTime: dropoffDateTime,
      comments: formData.comments || undefined,
    })

    setIsSubmitting(false)

    if (result.success) {
      setIsSuccess(true)
      setFormData({
        firstName: "",
        lastName: "",
        houseId: "",
        email: "",
        phone: "",
        sourceAddress: "",
        destinationAddress: "",
        pickupDate: "",
        pickupTime: "",
        dropoffDate: "",
        dropoffTime: "",
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="house">House / Residence <span className="text-destructive">*</span></Label>
              {isLoadingHouses ? (
                <div className="flex items-center gap-2 text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading houses...
                </div>
              ) : houses.length === 0 ? (
                <div className="text-muted-foreground py-2">
                  No houses available. Please contact an administrator.
                </div>
              ) : (
                <Select
                  value={formData.houseId}
                  onValueChange={(value) => setFormData({ ...formData, houseId: value })}
                  required
                >
                  <SelectTrigger id="house">
                    <SelectValue placeholder="Select a house" />
                  </SelectTrigger>
                  <SelectContent>
                    {houses.map((house) => (
                      <SelectItem key={house.id} value={house.id.toString()}>
                        {house.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                <Label htmlFor="sourceAddress">Pickup Address</Label>
                <Input
                  id="sourceAddress"
                  placeholder="Pickup Address"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Label className="text-base font-medium">Requested Pickup Time</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="pickupDate" className="text-sm text-muted-foreground">Date</Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pickupTime" className="text-sm text-muted-foreground">Time</Label>
                    <Input
                      id="pickupTime"
                      type="time"
                      value={formData.pickupTime}
                      onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-base font-medium">Requested Dropoff Time</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="dropoffDate" className="text-sm text-muted-foreground">Date</Label>
                    <Input
                      id="dropoffDate"
                      type="date"
                      value={formData.dropoffDate}
                      onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dropoffTime" className="text-sm text-muted-foreground">Time</Label>
                    <Input
                      id="dropoffTime"
                      type="time"
                      value={formData.dropoffTime}
                      onChange={(e) => setFormData({ ...formData, dropoffTime: e.target.value })}
                      required
                    />
                  </div>
                </div>
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

            <Button 
              type="submit" 
              className="w-full md:w-auto px-8 py-2" 
              disabled={isSubmitting || isLoadingHouses || houses.length === 0}
            >
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

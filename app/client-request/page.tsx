"use client";

import type React from "react";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClientRequestPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    houseId: "",
    email: "",
    phone: "",
    sourceAddress: "",
    destinationAddress: "",
    dropoffDate: "",
    dropoffTime: "",
    comments: "",
  });

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
    try {
      const digits = formData.phone.replace(/\D/g, "").slice(-10);
      const phoneE164 =
        digits.length === 10 ? `+1${digits}` : formData.phone;

      let dropoffISO = "";
      if (formData.dropoffDate && formData.dropoffTime) {
        dropoffISO = new Date(
          `${formData.dropoffDate}T${formData.dropoffTime}:00`
        ).toISOString();
      }

      const submitData = {
        ...formData,
        phone: phoneE164,
        dropoffTime: dropoffISO,
      };

      const response = await fetch(
        "https://svvguxhkhesrlzmydghw.supabase.co/functions/v1/submit-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(submitData),
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Request submission failed");
        return;
      }

      alert("Request submitted successfully!");

      setFormData({
        firstName: "",
        lastName: "",
        houseId: "",
        email: "",
        phone: "",
        sourceAddress: "",
        destinationAddress: "",
        dropoffDate: "",
        dropoffTime: "",
        comments: "",
      });
    } catch (err: any) {
      console.error(err);
      alert("Unexpected error: " + (err.message || err));
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        background: "linear-gradient(180deg, #eaf1fb 0%, #142850 100%)",
        minHeight: "100vh",
      }}
    >
      <div className="w-full max-w-2xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="bg-card rounded-xl shadow-lg p-6 md:p-8">
          {/* LOGO + TITLE */}
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary p-2 rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src="/HavenWayAppLogo.png"
                alt="HavenWay logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Client Request Form
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* (everything else unchanged) */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="houseId">House ID</Label>
                <Select
                  value={formData.houseId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, houseId: value })
                  }
                >
                  <SelectTrigger id="houseId">
                    <SelectValue placeholder="Select House ID" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* rest of form unchanged */}

            <Button type="submit" className="w-full md:w-auto px-8 py-2">
              Submit
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

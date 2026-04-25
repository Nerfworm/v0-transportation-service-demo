"use client"

import { useState, useEffect } from "react"
import { Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from '@/components/DashboardLayout'
import { useUser, ROLE } from "@/context/UserContext"

type Driver = {
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  supabase_uid: string;
};

export default function DriversPage() {
  const user = useUser()
  const [driversList, setDriversList] = useState<Driver[]>([]);

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const res = await fetch("https://svvguxhkhesrlzmydghw.supabase.co/functions/v1/get-drivers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          credentials: "include"
        });
        const data = await res.json();
        if (data.valid && Array.isArray(data.data)) {
          setDriversList(data.data);
        }
      } catch (err) {}
    }
    fetchDrivers();
  }, []);

  // Block Transporters and Reviewers from accessing this page
  if (user && user.role_id !== ROLE.ADMIN && user.role_id !== ROLE.TRANSPORTATION_COORDINATOR) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You don't have access to this page.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Drivers</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {driversList.map((driver) => (
            <Card key={driver.supabase_uid} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {driver.first_name[0]}{driver.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{driver.first_name} {driver.last_name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{driver.email ?? <span className="italic">No email</span>}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{driver.phone}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Bell } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { sampleEvents, getWeekDates } from '@/lib/events'

function HomePage() {
  const router = useRouter();
  return (
    <DashboardLayout>
      <section className="flex-1 flex items-center justify-center px-50 py-12">
        <div className="w-full min-h-[700px] flex flex-col justify-center items-center">
          {/* Widgets removed as requested */}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default HomePage;

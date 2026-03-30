'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Bell } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { sampleEvents, getWeekDates } from '@/lib/events'

export default function HomePage() {
  const router = useRouter();
  return (
    <DashboardLayout>
      <section className="flex-1 flex items-center justify-center px-50 py-12">
        <div className="w-full min-h-[700px] grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Calendar Widget */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarWidget />
            </CardContent>
          </Card>

          {/* Recent Activity Widget */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivityWidget />
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardLayout>
  );
}

// Calendar Widget Component
function CalendarWidget() {
  const weekDates = getWeekDates();
  // Map events to days
  const eventsByDay = weekDates.map((date, idx) => {
    const events = sampleEvents.filter(e => e.day === idx);
    return { date, events };
  });
  return (
    <div className="grid grid-cols-7 gap-2 text-xs">
      {eventsByDay.map(({ date, events }, idx) => (
        <div key={idx} className="border rounded p-2 min-h-[80px]">
          <div className="font-semibold mb-1">{date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          {events.length === 0 ? (
            <div className="text-muted-foreground">No events</div>
          ) : (
            events.map(ev => (
              <div key={ev.id} className="mb-1">
                <span className="font-medium">{ev.title}</span>
                <div className="text-xs text-muted-foreground">{ev.description}</div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}

// Recent Activity Widget Component (placeholder)
function RecentActivityWidget() {
  // Placeholder data
  const activities = [
    { id: 1, text: "Request #123 approved", time: "2 hours ago" },
    { id: 2, text: "Driver John assigned to ride", time: "4 hours ago" },
    { id: 3, text: "New request submitted", time: "Today" },
  ];
  return (
    <ul className="space-y-2">
      {activities.map(a => (
        <li key={a.id} className="flex justify-between items-center border-b pb-1 last:border-b-0">
          <span>{a.text}</span>
          <span className="text-xs text-muted-foreground">{a.time}</span>
        </li>
      ))}
    </ul>
  );
}

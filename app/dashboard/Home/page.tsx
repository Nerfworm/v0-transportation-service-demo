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
        <div className="w-full min-h-[700px] grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats Widget */}
          <Card className="shadow-md col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <StatsWidget />
            </CardContent>
          </Card>

          {/* Calendar Widget */}
          <Card className="shadow-md col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarWidget />
            </CardContent>
          </Card>

          {/* Recent Activity Widget */}
          <Card className="shadow-md col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentActivityWidget />
            </CardContent>
          </Card>
        </div>
      // Stats Widget Component
      import { useEffect, useState } from 'react';
      import { fetchGetRequests } from '@/lib/edgeClient';

      function StatsWidget() {
        const [stats, setStats] = useState({ pending: 0, unreviewed: 0, approved: 0 });
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);

        useEffect(() => {
          fetchGetRequests("")
            .then((res) => {
              const data = res.data || [];
              setStats({
                pending: data.filter((r: any) => r.approved === 'pending').length,
                unreviewed: data.filter((r: any) => r.approved === 'Unreviewed').length,
                approved: data.filter((r: any) => r.approved === 'approved').length,
              });
              setLoading(false);
            })
            .catch((err) => {
              setError('Failed to load stats');
              setLoading(false);
            });
        }, []);

        if (loading) return <div>Loading...</div>;
        if (error) return <div className="text-red-500">{error}</div>;

        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Pending Requests</span>
              <span className="font-bold text-yellow-600">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Unreviewed Requests</span>
              <span className="font-bold text-blue-600">{stats.unreviewed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Approved Requests</span>
              <span className="font-bold text-green-600">{stats.approved}</span>
            </div>
          </div>
        );
      }
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

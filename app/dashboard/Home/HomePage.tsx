
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
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <DashboardLayout
      menuOpen={menuOpen}
      setMenuOpen={setMenuOpen}
      onSettingsClick={() => {
        router.push('/settings');
        setMenuOpen(false);
      }}
      onProfileClick={() => {
        router.push('/profile');
        setMenuOpen(false);
      }}
      onHelpClick={() => {
        router.push('/help');
        setMenuOpen(false);
      }}
    >
      <section className="flex-1 flex items-center justify-center px-50 py-12">
        <div className="bg-white rounded-3xl shadow-2xl w-full min-h-[700px] flex flex-col md:flex-row gap-8 p-8 md:p-12 justify-center items-stretch" style={{
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        }}>
          {/* Calendar Preview Widget */}
          <Card className="flex-1 min-w-[220px] flex flex-col items-center justify-center">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" /> Calendar Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 w-full bg-muted rounded-lg p-2 text-muted-foreground">
                <div className="text-sm font-medium mb-1">This Week</div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {getWeekDates(new Date()).map((date, idx) => {
                    const ev = sampleEvents.find((e) => e.day === idx)
                    return (
                      <div key={idx} className="h-14 bg-white/10 rounded p-1 flex flex-col items-start justify-start">
                        <div className="text-[10px] text-muted-foreground">{date.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                        {ev ? (
                          <div className="mt-1 bg-accent text-accent-foreground rounded px-1 py-0.5 w-full text-[11px]">
                            <div className="font-medium">{ev.title}</div>
                            {ev.driver && <div className="text-[10px] opacity-80">{ev.driver}</div>}
                          </div>
                        ) : (
                          <div className="mt-1 text-[11px] text-muted-foreground opacity-60">—</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Driver Schedule Widget */}
          <Card className="flex-1 min-w-[220px] flex flex-col items-center justify-center">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" /> Driver Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24 w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                Driver Schedule Widget
              </div>
            </CardContent>
          </Card>
          {/* Notifications Widget */}
          <Card className="flex-1 min-w-[220px] flex flex-col items-center justify-center">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="w-5 h-5 text-primary" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24 w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                Notifications Widget
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </DashboardLayout>
  );
}


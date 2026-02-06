
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Bell, Settings, User, HelpCircle, Home as HomeIcon, Menu } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <main className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(180deg, #eaf1fb 0%, #142850 100%)',
      minHeight: '100vh',
    }}>
      {/* Top Task Bar */}
      <header className="w-full bg-[#142850] py-3 px-6 flex items-center justify-between shadow-md">
        {/* Left: Logo Placeholder */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-2xl select-none">
            LOGO
          </div>
          {/* Navigation Buttons */}
          <nav className="flex items-center gap-3 ml-2">
            <Link href="/Home">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold" style={{ borderRadius: '2rem' }}>
                <HomeIcon className="mr-2 w-6 h-6" /> Home
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold" style={{ borderRadius: '2rem' }}>
                <Calendar className="mr-2 w-6 h-6" /> Calendar
              </Button>
            </Link>
            <Link href="/dashboard/drivers">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold" style={{ borderRadius: '2rem' }}>
                <Users className="mr-2 w-6 h-6" /> Drivers
              </Button>
            </Link>
          </nav>
        </div>
        {/* Right: Menu Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-full text-white hover:bg-white/10 px-12 py-5 transition-transform"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{ transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
          >
            <Menu className="w-10 h-10" />
          </Button>
        </div>
      </header>

      {/* Side Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setMenuOpen(false)} />
      )}

      {/* Side Menu */}
      <div
        className="fixed top-0 right-0 h-full w-64 bg-[#142850] shadow-lg z-50 flex flex-col p-6 transition-transform"
        style={{
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="space-y-4">
          <Button
            className="w-full justify-start rounded-lg px-4 py-3 text-lg font-semibold"
            onClick={() => {
              router.push('/settings')
              setMenuOpen(false)
            }}
          >
            <Settings className="mr-2 w-5 h-5" /> Settings
          </Button>
          <Button
            className="w-full justify-start rounded-lg px-4 py-3 text-lg font-semibold"
            onClick={() => {
              router.push('/profile')
              setMenuOpen(false)
            }}
          >
            <User className="mr-2 w-5 h-5" /> Profile
          </Button>
          <Button
            className="w-full justify-start rounded-lg px-4 py-3 text-lg font-semibold"
            onClick={() => {
              router.push('/help')
              setMenuOpen(false)
            }}
          >
            <HelpCircle className="mr-2 w-5 h-5" /> Help
          </Button>
        </div>
      </div>

      {/* Centered White Widget Box */}
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
              <div className="h-24 w-full bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                Calendar Widget
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
    </main>
  )
}
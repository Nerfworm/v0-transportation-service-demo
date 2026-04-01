import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Home as HomeIcon, Calendar, Bell, Users, Settings, User, HelpCircle } from "lucide-react";
import Link from "next/link";


interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/staff-login';
    }
  };
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
            <Link href="/dashboard/Home">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold" style={{ borderRadius: '2rem' }}>
                <HomeIcon className="mr-2 w-6 h-6" /> Home
              </Button>
            </Link>
            <Link href="/dashboard/calendar">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold" style={{ borderRadius: '2rem' }}>
                <Calendar className="mr-2 w-6 h-6" /> Calendar
              </Button>
            </Link>
            <Link href="/dashboard/review">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold" style={{ borderRadius: '2rem' }}>
                <Bell className="mr-2 w-6 h-6" /> Review
              </Button>
            </Link>
            <Link href="/dashboard/drivers">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold" style={{ borderRadius: '2rem' }}>
                <Users className="mr-2 w-6 h-6" /> Drivers
              </Button>
            </Link>
          </nav>
        </div>
        {/* Right: Settings Button Only */}
        <div className="flex items-center gap-2 justify-center h-full">
          <Link href="/settings">
            <Button variant="ghost" className="rounded-full text-white hover:bg-white/10 p-0" style={{ width: 50, height: 50 }} aria-label="Settings">
                <Settings style={{ width: '100%', height: '100%' }} />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 py-8">
        {children}
      </div>
    </main>
  );
}


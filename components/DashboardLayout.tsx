import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Home as HomeIcon, Calendar, Bell, Users, Settings, User, HelpCircle } from "lucide-react";
import Link from "next/link";

interface DashboardLayoutProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  children: React.ReactNode;
  onSettingsClick?: () => void;
  onProfileClick?: () => void;
  onHelpClick?: () => void;
}

export default function DashboardLayout({
  menuOpen,
  setMenuOpen,
  children,
  onSettingsClick,
  onProfileClick,
  onHelpClick,
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
        {/* Right: Menu Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="rounded-full text-white hover:bg-white/10 px-6 py-3 transition-transform"
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
        className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col p-0 transition-transform"
        style={{
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="space-y-0 flex-1">
          <div
            className="w-full px-6 py-4 text-lg font-semibold flex items-center cursor-pointer transition-colors hover:bg-gray-100"
            onClick={onSettingsClick}
          >
            <Settings className="mr-3 w-5 h-5" /> Settings
          </div>
          <div
            className="w-full px-6 py-4 text-lg font-semibold flex items-center cursor-pointer transition-colors hover:bg-gray-100"
            onClick={onProfileClick}
          >
            <User className="mr-3 w-5 h-5" /> Profile
          </div>
          <div
            className="w-full px-6 py-4 text-lg font-semibold flex items-center cursor-pointer transition-colors hover:bg-gray-100"
            onClick={onHelpClick}
          >
            <HelpCircle className="mr-3 w-5 h-5" /> Help
          </div>
        </div>
        <div
          className="w-full px-6 py-4 text-lg font-semibold flex items-center cursor-pointer transition-colors hover:bg-red-100 text-red-600 mb-4"
          style={{ marginTop: 'auto' }}
          onClick={handleLogout}
        >
          <svg className="mr-3 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
          Log out
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6 py-8">
        {children}
      </div>
    </main>
  );
}

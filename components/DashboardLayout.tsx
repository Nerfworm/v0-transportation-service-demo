"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Home as HomeIcon, Calendar, Bell, Users, Settings } from "lucide-react"
import Link from "next/link"
import { fetchGetNotifications, markNotificationsRead } from "@/lib/edgeClient"

interface Notification {
  id: number
  title: string
  body: string
  created_at: string
}

function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const loadNotifications = async () => {
    try {
      const { data } = await fetchGetNotifications()
      setNotifications((data || []).slice(0, 20))
    } catch {}
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  const clearOne = async (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await markNotificationsRead([id])
    } catch {}
  }

  const clearAll = async () => {
    const ids = notifications.map((n) => n.id)
    setNotifications([])
    setOpen(false)
    try {
      await markNotificationsRead(ids)
    } catch {}
  }

  return (
    <div className="relative" ref={containerRef}>
      <Button
        variant="ghost"
        className="relative rounded-full text-white hover:bg-white/10 p-0"
        style={{ width: 50, height: 50 }}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell style={{ width: "60%", height: "60%" }} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold px-0.5">
            {notifications.length > 9 ? "9+" : notifications.length}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-14 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm">Notifications</span>
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-xs text-blue-600">
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                No new notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex gap-3 px-4 py-3 border-b hover:bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-gray-500">{n.body}</p>
                  </div>
                  <button onClick={() => clearOne(n.id)} className="text-gray-400 hover:text-red-500">
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #eaf1fb 0%, #142850 100%)",
      }}
    >
      <header className="w-full bg-[#142850] py-3 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          
          {/* ✅ FIXED LOGO (ONLY CHANGE) */}
          <Link href="/" className="flex items-center">
            <Image
              src="/HavenWayFullLogo.png"
              alt="HavenWay full logo"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          {/* ❗ NAV BUTTONS UNCHANGED */}
          <nav className="flex items-center gap-3 ml-2">
            <Link href="/dashboard/Home">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold">
                <HomeIcon className="mr-2 w-6 h-6" /> Home
              </Button>
            </Link>

            <Link href="/dashboard/calendar">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold">
                <Calendar className="mr-2 w-6 h-6" /> Calendar
              </Button>
            </Link>

            <Link href="/dashboard/review">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold">
                <Bell className="mr-2 w-6 h-6" /> Review
              </Button>
            </Link>

            <Link href="/dashboard/drivers">
              <Button className="rounded-full text-lg px-16 py-6 font-semibold">
                <Users className="mr-2 w-6 h-6" /> Drivers
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />

          <Link href="/settings">
            <Button
              variant="ghost"
              className="rounded-full text-white hover:bg-white/10 p-0"
              style={{ width: 50, height: 50 }}
            >
              <Settings style={{ width: "60%", height: "60%" }} />
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-6 py-8">
        {children}
      </div>
    </main>
  )
}

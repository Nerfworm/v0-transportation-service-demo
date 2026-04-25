"use client"

import { createContext, useContext, useEffect, useState } from "react"

export const ROLE = {
  ADMIN: 1,
  TRANSPORTATION_COORDINATOR: 2,
  REVIEWER: 3,
  TRANSPORTER: 4,
} as const

type User = {
  role_id: number
  first_name: string
  last_name: string
} | null

const UserContext = createContext<User>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)

  useEffect(() => {
    fetch("https://svvguxhkhesrlzmydghw.supabase.co/functions/v1/my-account", {
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) setUser(data)
      })
      .catch(() => {})
  }, [])

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser() {
  return useContext(UserContext)
}
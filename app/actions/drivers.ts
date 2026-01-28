"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function getDrivers() {
  const supabase = await getSupabaseServerClient()

  // Get accounts that have a driver role
  const { data: drivers, error } = await supabase
    .from("account")
    .select(`
      id,
      username,
      first_name,
      last_name,
      email,
      phone_number,
      role:role_id(id, name)
    `)
    .order("first_name")

  if (error) {
    console.error("Error fetching drivers:", error)
    return []
  }

  return drivers || []
}

export async function getStaffMembers() {
  const supabase = await getSupabaseServerClient()

  const { data: staff, error } = await supabase
    .from("account")
    .select(`
      id,
      username,
      first_name,
      last_name,
      email,
      phone_number,
      role:role_id(id, name, description)
    `)
    .order("first_name")

  if (error) {
    console.error("Error fetching staff:", error)
    return []
  }

  return staff || []
}

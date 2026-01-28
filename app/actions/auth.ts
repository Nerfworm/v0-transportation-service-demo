"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

export type AuthResult = {
  success: boolean
  error?: string
  user?: {
    id: number
    username: string
    firstName: string
    lastName: string
    roleId: number
  }
}

export async function login(username: string, password: string): Promise<AuthResult> {
  const supabase = await getSupabaseServerClient()

  // Fetch the user by username
  const { data: user, error } = await supabase
    .from("account")
    .select("id, username, password_hash, first_name, last_name, role_id")
    .eq("username", username)
    .single()

  if (error || !user) {
    return { success: false, error: "Invalid username or password" }
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash)
  if (!isValidPassword) {
    return { success: false, error: "Invalid username or password" }
  }

  // Set session cookie
  const cookieStore = await cookies()
  cookieStore.set("session_user_id", user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      roleId: user.role_id,
    },
  }
}

export async function register(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
  username: string
  password: string
}): Promise<AuthResult> {
  const supabase = await getSupabaseServerClient()

  // Check if username already exists
  const { data: existingUser } = await supabase
    .from("account")
    .select("id")
    .eq("username", data.username)
    .single()

  if (existingUser) {
    return { success: false, error: "Username already exists" }
  }

  // Get role ID
  const { data: role } = await supabase
    .from("role")
    .select("id")
    .eq("name", data.role)
    .single()

  const roleId = role?.id || 1 // Default to role 1 if not found

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10)

  // Create account
  const { data: newUser, error } = await supabase
    .from("account")
    .insert({
      username: data.username,
      password_hash: passwordHash,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone_number: data.phone,
      role_id: roleId,
    })
    .select("id, username, first_name, last_name, role_id")
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      roleId: newUser.role_id,
    },
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session_user_id")
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session_user_id")?.value

  if (!userId) {
    return null
  }

  const supabase = await getSupabaseServerClient()
  const { data: user } = await supabase
    .from("account")
    .select("id, username, first_name, last_name, email, role_id, role:role_id(name)")
    .eq("id", parseInt(userId))
    .single()

  return user
}

export async function getRoles() {
  const supabase = await getSupabaseServerClient()
  const { data: roles } = await supabase
    .from("role")
    .select("id, name, description")
    .order("name")

  return roles || []
}

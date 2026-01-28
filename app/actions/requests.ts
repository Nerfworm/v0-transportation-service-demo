"use server"

import { getSupabaseServerClient, getSupabaseAnonClient } from "@/lib/supabase/server"

export type RequestResult = {
  success: boolean
  error?: string
  requestId?: number
}

export type House = {
  id: number
  address: string
}

export async function getHouses(): Promise<House[]> {
  const supabase = getSupabaseAnonClient()

  const { data: houses, error } = await supabase
    .from("house")
    .select("id, address")
    .order("address", { ascending: true })

  if (error) {
    console.error("Error fetching houses:", error)
    return []
  }

  return houses || []
}

export async function submitTransportRequest(data: {
  firstName: string
  lastName: string
  houseId: number
  email?: string
  phone?: string
  sourceAddress: string
  destinationAddress: string
  pickupTime: string
  dropoffTime: string
  comments?: string
}): Promise<RequestResult> {
  // Use anonymous client for public request submissions
  // This ensures the anon RLS policies are used (not authenticated user policies)
  const supabase = getSupabaseAnonClient()

  // Validate that house_id is provided
  if (!data.houseId) {
    return { success: false, error: "House selection is required" }
  }

  // Parse phone to integer if provided (schema uses int8)
  const phoneNumber = data.phone ? parseInt(data.phone.replace(/\D/g, ''), 10) : null

  // Insert the request with required house_id
  const { data: request, error } = await supabase
    .from("request")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      house_id: data.houseId,
      email: data.email || null,
      phone: phoneNumber,
      source_address: data.sourceAddress,
      destination_address: data.destinationAddress,
      requested_pickup_time: data.pickupTime,
      requested_dropoff_time: data.dropoffTime,
      request_comment: data.comments || null,
      approved: "Pending",
    })
    .select("id")
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, requestId: request.id }
}

export async function getRequests(status?: "Pending" | "Approved" | "Rejected") {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("request")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone,
      source_address,
      destination_address,
      requested_pickup_time,
      requested_dropoff_time,
      request_comment,
      approved,
      reviewed_at,
      house:house_id(id, address)
    `)
    .order("requested_pickup_time", { ascending: false })

  if (status) {
    query = query.eq("approved", status)
  }

  const { data: requests, error } = await query

  if (error) {
    console.error("Error fetching requests:", error)
    return []
  }

  return requests || []
}

export async function updateRequestStatus(
  requestId: number,
  status: "Approved" | "Rejected",
  reviewedBy?: number,
  approvalComment?: string
): Promise<RequestResult> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from("request")
    .update({ 
      approved: status,
      reviewed_by: reviewedBy || null,
      reviewed_at: new Date().toISOString(),
      approval_comment: approvalComment || null
    })
    .eq("id", requestId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getRequestsForCalendar(startDate: Date, endDate: Date) {
  const supabase = await getSupabaseServerClient()

  const { data: requests, error } = await supabase
    .from("request")
    .select(`
      id,
      first_name,
      last_name,
      source_address,
      destination_address,
      requested_pickup_time,
      requested_dropoff_time,
      approved,
      transport:transport_id(id, staff_id, pickup_time, dropoff_time)
    `)
    .eq("approved", "Approved")
    .gte("requested_dropoff_time", startDate.toISOString())
    .lte("requested_dropoff_time", endDate.toISOString())

  if (error) {
    console.error("Error fetching calendar requests:", error)
    return []
  }

  return requests || []
}

export async function getPendingRequestCount() {
  const supabase = await getSupabaseServerClient()

  const { count, error } = await supabase
    .from("request")
    .select("*", { count: "exact", head: true })
    .eq("approved", "Pending")

  if (error) {
    console.error("Error fetching pending count:", error)
    return 0
  }

  return count || 0
}

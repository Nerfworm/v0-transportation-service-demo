"use server"

import { getSupabaseServerClient } from "@/lib/supabase/server"

export type RequestResult = {
  success: boolean
  error?: string
  requestId?: number
}

export async function submitTransportRequest(data: {
  firstName: string
  lastName: string
  houseName?: string
  email?: string
  phone?: string
  sourceAddress: string
  destinationAddress: string
  arrivalTime: string
  comments?: string
}): Promise<RequestResult> {
  const supabase = await getSupabaseServerClient()

  // Find or create house if house name provided
  let houseId: number | null = null
  if (data.houseName) {
    const { data: existingHouse } = await supabase
      .from("house")
      .select("id")
      .eq("name", data.houseName)
      .single()

    if (existingHouse) {
      houseId = existingHouse.id
    } else {
      const { data: newHouse } = await supabase
        .from("house")
        .insert({ name: data.houseName, address: data.sourceAddress })
        .select("id")
        .single()
      houseId = newHouse?.id || null
    }
  }

  // Insert the request
  const { data: request, error } = await supabase
    .from("request")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      house_id: houseId,
      email: data.email || null,
      phone_number: data.phone || null,
      source_address: data.sourceAddress,
      destination_address: data.destinationAddress,
      arrival_time: data.arrivalTime,
      comments: data.comments || null,
      approved: "Pending",
    })
    .select("id")
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, requestId: request.id }
}

export async function getRequests(status?: "Pending" | "Approved" | "Denied") {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from("request")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone_number,
      source_address,
      destination_address,
      arrival_time,
      comments,
      approved,
      created_at,
      house:house_id(id, name, address)
    `)
    .order("created_at", { ascending: false })

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
  status: "Approved" | "Denied"
): Promise<RequestResult> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from("request")
    .update({ approved: status })
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
      arrival_time,
      approved,
      transport:transport(id, staff_id, account:staff_id(first_name, last_name))
    `)
    .eq("approved", "Approved")
    .gte("arrival_time", startDate.toISOString())
    .lte("arrival_time", endDate.toISOString())

  if (error) {
    console.error("Error fetching calendar requests:", error)
    return []
  }

  return requests || []
}

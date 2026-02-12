export interface CalendarEvent {
  id: string
  title: string
  day: number
  hour: number
  driver?: string
  description?: string
  location?: string
  passengers?: string
  notes?: string
}

export const sampleEvents: CalendarEvent[] = [
  { id: "1", title: "Transport", day: 0, hour: 0, driver: "John", description: "Airport pickup", location: "Downtown Hub", passengers: "3", notes: "VIP service" },
  { id: "2", title: "Delivery", day: 0, hour: 1, driver: "Jane", description: "Package delivery", location: "Central Station", passengers: "0", notes: "Fragile items" },
]

export const getWeekDates = (currentDate = new Date()) => {
  const dates: Date[] = []
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    dates.push(date)
  }
  return dates
}

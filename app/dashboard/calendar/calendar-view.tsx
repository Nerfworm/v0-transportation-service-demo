"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const HOURS = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM"]

type Request = {
  id: number
  first_name: string
  last_name: string
  source_address: string
  destination_address: string
  arrival_time: string
  approved: string
}

type Driver = {
  id: number
  first_name: string
  last_name: string
}

interface CalendarViewProps {
  requests: Request[]
  drivers: Driver[]
}

export default function CalendarView({ requests, drivers }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterDriver, setFilterDriver] = useState("all")

  const getWeekDates = () => {
    const dates = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates()

  const goToPreviousWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() - 7)
      return newDate
    })
  }

  const goToNextWeek = () => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + 7)
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const getEventsForSlot = (dayIndex: number, hourIndex: number) => {
    const slotDate = weekDates[dayIndex]
    const slotHour = hourIndex + 8 // Starting from 8 AM

    return requests.filter((request) => {
      const requestDate = new Date(request.arrival_time)
      return (
        requestDate.getDate() === slotDate.getDate() &&
        requestDate.getMonth() === slotDate.getMonth() &&
        requestDate.getFullYear() === slotDate.getFullYear() &&
        requestDate.getHours() === slotHour
      )
    })
  }

  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={goToToday} className="bg-transparent">
            Today
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold">{monthYear}</h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter By Driver</span>
          <Select value={filterDriver} onValueChange={setFilterDriver}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Drivers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drivers</SelectItem>
              {drivers.map((driver) => (
                <SelectItem key={driver.id} value={driver.id.toString()}>
                  {driver.first_name} {driver.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-8 border-b border-border">
            <div className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border" />
            {weekDates.map((date, index) => (
              <div key={index} className="p-3 text-center border-r border-border last:border-r-0">
                <div className="text-xs font-medium text-muted-foreground">{DAYS[index]}</div>
                <div
                  className={`text-lg font-bold ${
                    date.toDateString() === new Date().toDateString()
                      ? "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                      : ""
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {HOURS.map((hour, hourIndex) => (
            <div key={hour} className="grid grid-cols-8 border-b border-border last:border-b-0">
              <div className="p-3 text-xs text-muted-foreground border-r border-border flex items-start justify-end">
                {hour}
              </div>
              {weekDates.map((_, dayIndex) => {
                const events = getEventsForSlot(dayIndex, hourIndex)
                return (
                  <div
                    key={dayIndex}
                    className="p-1 min-h-16 border-r border-border last:border-r-0 hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="bg-primary/10 text-primary text-xs p-1 rounded mb-1"
                      >
                        <div className="font-medium truncate">
                          {event.first_name} {event.last_name}
                        </div>
                        <div className="text-muted-foreground truncate text-[10px]">
                          {event.destination_address}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

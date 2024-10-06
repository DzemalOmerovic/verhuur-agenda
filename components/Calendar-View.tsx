"use client"

import React, { useState, useEffect } from 'react'
import {
  addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval,
  format, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay,
  getDay
} from 'date-fns'
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { CalendarViewCard } from './Calendar-View-Card'

interface Car {
  id: number
  name: string
  number_plate: string
  mileage: number
  status: string
}

interface Reservation {
  id: number
  car_id: number
  start_date: string
  end_date: string
  customer_name: string
  car: Car
}

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Reservation[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [cars, setCars] = useState<Car[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchReservationsAndCars()
  }, [])

  const fetchReservationsAndCars = async () => {
    const { data: reservationsData, error: reservationsError } = await supabase
      .from('reservations')
      .select(`
        *,
        car:cars(*)
      `)

    if (reservationsError) {
      console.error('Error fetching reservations:', reservationsError)
    } else {
      setEvents(reservationsData)
    }

    const { data: carsData, error: carsError } = await supabase
      .from('cars')
      .select('*')

    if (carsError) {
      console.error('Error fetching cars:', carsError)
    } else {
      setCars(carsData)
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1))
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })

    const startDay = getDay(start)
    const prefixDays = Array(startDay).fill(null)

    return [...prefixDays, ...days]
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event =>
      isSameDay(new Date(event.start_date), date) ||
      isSameDay(new Date(event.end_date), date) ||
      (new Date(event.start_date) <= date && new Date(event.end_date) >= date)
    )
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setIsDialogOpen(true)
  }

  return (
    <div>
      <h1 className="text-lg font-semibold pb-4 sm:mb-0 sm:mr-6">Calendar View</h1>
      <div className="flex justify-between mb-4">
        <div className="h-full flex flex-col p-4 bg-white w-full rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6 mt-4">
            <Button onClick={handlePrevMonth} variant="outline">Previous Month</Button>
            <h2 className="text-3xl font-bold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button onClick={handleNextMonth} variant="outline">Next Month</Button>
          </div>
          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-bold p-2 text-gray-600">
                {day}
              </div>
            ))}
            {getDaysInMonth().map((date, index) => {
              const dayEvents = date ? getEventsForDate(date) : []
              return (
                <div
                  key={date ? date.toString() : `empty-${index}`}
                  className={`
                    p-2 border rounded-lg shadow-sm min-h-[150px] transition-colors cursor-pointer
                    ${!date ? 'bg-gray-50' :
                      !isSameMonth(date, currentDate) ? 'bg-gray-100 text-gray-400' : 'bg-white'}
                    ${date && isToday(date) ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                  onClick={() => date && handleDateClick(date)}
                >
                  {date && (
                    <>
                      <div className="text-right font-semibold">{format(date, 'd')}</div>
                      <div className="mt-1 space-y-1">
                        {dayEvents.slice(0, 3).map((event, index) => (
                          <div key={event.id} className="text-xs p-1 rounded bg-blue-500 truncate text-white">
                            {event.customer_name} - {event.car.name}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <CalendarViewCard
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        date={selectedDate}
        events={selectedDate ? getEventsForDate(selectedDate) : []}
      />
    </div>
  )
}
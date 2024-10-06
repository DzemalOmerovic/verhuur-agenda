import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

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

interface CalendarViewCardProps {
  isOpen: boolean
  onClose: () => void
  date: Date | null
  events: Reservation[]
}

export function CalendarViewCard({ isOpen, onClose, date, events }: CalendarViewCardProps) {
  if (!date) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reservations for {format(date, 'MMMM d, yyyy')}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {events.length === 0 ? (
            <p>No reservations for this date.</p>
          ) : (
            <ul className="space-y-4">
              {events.map((event) => (
                <li key={event.id} className="bg-gray-100 p-4 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{event.customer_name}</p>
                      <p className="text-sm text-gray-600">
                        From: {format(new Date(event.start_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-600">
                        To: {format(new Date(event.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">{event.car.name}</p>
                      <p className="text-sm text-gray-600">Plate: {event.car.number_plate}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm"><span className="font-medium">Mileage:</span> {event.car.mileage} km</p>
                    <p className="text-sm"><span className="font-medium">Status:</span> {event.car.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

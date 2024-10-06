"use client"

import React, { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { addDays, eachDayOfInterval, isWithinInterval, isSameDay } from "date-fns";
import { DateRange } from "react-day-picker";

interface Car {
  id: number;  // Change this to number
  name: string;
}

interface Reservation {
  start_date: string;
  end_date: string;
}

export function AddReservationForm() {
  const [carId, setCarId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserData(user);
    }
    fetchUser();
    fetchCars();
  }, []);

  useEffect(() => {
    if (carId) {
      fetchReservations(carId.toString());
    }
  }, [carId]);

  const fetchCars = async () => {
    const { data, error } = await supabase.from('cars').select('id, name');
    if (error) {
      console.error('Error fetching cars:', error);
    } else {
      setCars(data || []);
    }
  };

  const fetchReservations = async (carId: string) => {
    const { data, error } = await supabase
      .from('reservations')
      .select('start_date, end_date')
      .eq('car_id', carId);

    if (error) {
      console.error('Error fetching reservations:', error);
    } else {
      setReservations(data || []);
    }
  };

  const isDateDisabled = (date: Date) => {
    return reservations.some(reservation =>
      isWithinInterval(date, {
        start: new Date(reservation.start_date),
        end: new Date(reservation.end_date)
      }) ||
      isSameDay(date, new Date(reservation.start_date)) ||
      isSameDay(date, new Date(reservation.end_date))
    );
  };

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    if (newDateRange?.from && newDateRange?.to) {
      const rangeDates = eachDayOfInterval({
        start: newDateRange.from,
        end: newDateRange.to
      });

      const isRangeAvailable = rangeDates.every(date => !isDateDisabled(date));

      if (isRangeAvailable) {
        setDateRange(newDateRange);
        setError(null);
      } else {
        setError('De geselecteerde periode overlapt met een bestaande reservering.');
      }
    } else {
      setDateRange(newDateRange);
      setError(null);
    }
  };

  const handleCarChange = (value: string) => {
    setCarId(Number(value));
    setDateRange(undefined); // Reset date range when car changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!userData) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    if (!carId || !dateRange?.from || !dateRange?.to || !customerName || !customerPhone || !customerEmail) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        car_id: carId,  // No need to parse as integer now
        user_id: userData.id,
        start_date: dateRange.from.toISOString(),
        end_date: dateRange.to.toISOString(),
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
      });

    if (error) {
      setError(error.message);
      console.error('Insertion error:', error);
    } else {
      // Reset form
      setCarId(null);
      setDateRange({
        from: new Date(),
        to: addDays(new Date(), 7),
      });
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setIsOpen(false); // Close the dialog
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Reservation</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Reservation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="car">Car</Label>
            <Select value={carId?.toString()} onValueChange={handleCarChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a car" />
              </SelectTrigger>
              <SelectContent>
                {cars.map((car) => (
                  <SelectItem key={car.id} value={car.id.toString()}>{car.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Reservation Period</Label>
            <DatePickerWithRange
              date={dateRange}
              setDate={handleDateRangeChange}
              disabledDates={reservations.flatMap(reservation =>
                eachDayOfInterval({
                  start: new Date(reservation.start_date),
                  end: new Date(reservation.end_date)
                })
              )}
            />
          </div>
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>
          <div>
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input
              id="customerPhone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter customer phone"
            />
          </div>
          <div>
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter customer email"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Reservation'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
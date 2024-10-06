"use client"

import React, { useState, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, differenceInDays, isSameDay, setMonth, setYear, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { AddReservationForm } from "@/components/Car-Reservation-Form";
import { ReservationDetailsDialog } from "@/components/Reservations-Details-Dialog";

interface Reservation {
  id: number;
  car_id: string;
  start_date: string;
  end_date: string;
  customer_name: string;
  car_name: string; // Change this line: remove the optional modifier
}

interface Car {
  id: string;
  name: string;
}

export const CarReservationTimeline: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  const dayWidth = 60;

  useEffect(() => {
    fetchReservations();
    fetchCars();
  }, [currentMonth]);

  const fetchReservations = async () => {
    const startDate = startOfMonth(currentMonth).toISOString();
    const endDate = endOfMonth(currentMonth).toISOString();

    console.log('Fetching reservations for:', startDate, 'to', endDate);

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .gte('start_date', startDate)
      .lte('end_date', endDate);

    if (error) {
      console.error('Error fetching reservations:', error);
    } else {
      console.log('Fetched reservations:', data);
      setReservations(data || []);
    }
  };

  const fetchCars = async () => {
    console.log('Fetching cars');

    const { data, error } = await supabase
      .from('cars')
      .select('id, name');

    if (error) {
      console.error('Error fetching cars:', error);
    } else {
      console.log('Fetched cars:', data);
      setCars(data || []);
    }
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const goToPreviousMonth = () => setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  const goToNextMonth = () => setCurrentMonth(prevMonth => addMonths(prevMonth, 1));

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(setMonth(setYear(currentMonth, today.getFullYear()), today.getMonth()));

    setTimeout(() => {
      if (scrollRef.current) {
        const todayElement = scrollRef.current.querySelector('[data-today="true"]');
        if (todayElement) {
          const todayRect = todayElement.getBoundingClientRect();
          const containerRect = scrollRef.current.getBoundingClientRect();
          const scrollPosition = todayRect.left - containerRect.left + scrollRef.current.scrollLeft - (containerRect.width / 2) + (todayRect.width / 2);
          scrollRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }
      }
    }, 100);
  };

  const renderHeader = () => (
    <div className="flex sticky top-0 bg-white z-20 border-b border-gray-200 h-[60px] items-center">
      {daysInMonth.map((day, index) => {
        const isCurrentDay = isToday(day);
        return (
          <div
            key={index}
            className="flex-shrink-0 text-center border-r border-gray-200"
            style={{ width: `${dayWidth}px` }}
            data-today={isCurrentDay}
          >
            <div className={`text-xs font-semibold ${isCurrentDay ? 'text-blue-600' : ''}`}>{format(day, 'EEE')}</div>
            <div className={`text-sm font-bold ${isCurrentDay ? 'text-blue-600' : ''}`}>{format(day, 'd')}</div>
          </div>
        );
      })}
    </div>
  );

  const groupedReservations = React.useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      const car = cars.find(c => c.id === reservation.car_id);
      const carName = car ? car.name : 'Unknown Car';
      if (!acc[carName]) {
        acc[carName] = [];
      }
      acc[carName].push({
        ...reservation,
        startDate: new Date(reservation.start_date),
        endDate: new Date(reservation.end_date),
        carName
      });
      return acc;
    }, {} as Record<string, (Reservation & { startDate: Date; endDate: Date; carName: string })[]>);
  }, [reservations, cars]);

  const renderCurrentDayLine = () => {
    const today = new Date();
    if (isSameMonth(today, currentMonth)) {
      const dayOffset = differenceInDays(today, startOfMonth(currentMonth));
      return (
        <div
          className="absolute top-0 bottom-0 w-px bg-blue-500 z-10"
          style={{
            left: `${(dayOffset * dayWidth) + (dayWidth / 2)}px`,
          }}
        />
      );
    }
    return null;
  };

  const renderReservations = () => {
    return (
      <div className="relative">
        {renderCurrentDayLine()}
        {Object.entries(groupedReservations).map(([carName, carReservations]) => (
          <div key={carName} className="flex items-center h-14 border-b border-gray-200">
            <div className="relative flex-grow h-full">
              {carReservations.map((reservation) => {
                const startOffset = Math.max(differenceInDays(reservation.startDate, startOfMonth(currentMonth)), 0);
                const endDate = isSameMonth(reservation.endDate, currentMonth) ? reservation.endDate : endOfMonth(currentMonth);
                const duration = differenceInDays(endDate, startOfMonth(currentMonth)) - startOffset + 1;

                return (
                  <div
                    key={reservation.id}
                    className="absolute h-8 bg-blue-500 rounded-md flex items-center justify-center px-2 text-white text-xs font-semibold overflow-hidden cursor-pointer hover:bg-blue-600 transition-colors"
                    style={{
                      left: `${startOffset * dayWidth}px`,
                      width: `${duration * dayWidth}px`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                    onClick={() => {
                      setSelectedReservation({
                        ...reservation,
                        car_name: carName // Ensure car_name is always set
                      });
                      setIsDetailsDialogOpen(true);
                    }}
                  >
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                      {format(reservation.startDate, 'd MMM')} - {format(reservation.endDate, 'd MMM')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActiveMonth = () => {
    return (
      <div className="text-lg font-semibold text-start w-[150px]">
        {format(currentMonth, 'MMMM yyyy')}
      </div>
    );
  };

  const handleDeleteReservation = async (id: number) => {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting reservation:', error);
    } else {
      fetchReservations();
    }
  };

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Horizontal Calendar View</h1>
      <div className="flex flex-col sm:flex-row items-center mb-4 gap-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
          <div className="flex flex-col sm:flex-row items-center mb-4 sm:mb-0">
            <span className="text-lg font-semibold text-center sm:text-left mb-2 sm:mb-0 sm:mr-6">{renderActiveMonth()}</span>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
          <div className="w-full md:w-auto mt-4 md:mt-0">
            {/* AddReservationForm component will be placed here */}
            <AddReservationForm />
          </div>
        </div>
      </div>
      <div className="w-full bg-white shadow rounded-lg overflow-hidden flex">
        {/* Fixed left column */}
        <div className="w-[150px] flex-shrink-0 border-r border-gray-200">
          <div className="h-[60px] border-b border-gray-200 p-4 font-semibold">Car</div>
          {Object.keys(groupedReservations).map(carName => (
            <div key={carName} className="h-14 border-b border-gray-200 p-4 font-semibold truncate ">
              {carName}
            </div>
          ))}
        </div>
        {/* Scrollable right section */}
        <div className="overflow-x-auto flex-grow hide-scrollbar" ref={scrollRef}>
          <div style={{ width: `${daysInMonth.length * dayWidth}px` }}>
            {renderHeader()}
            {renderReservations()}
          </div>
        </div>
      </div>
      <ReservationDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        onDelete={handleDeleteReservation}
        reservation={selectedReservation}
      />
    </div>
  );
};

export default CarReservationTimeline;
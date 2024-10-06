import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { addDays, format, isWithinInterval, parseISO, eachDayOfInterval, startOfDay, endOfDay } from 'date-fns';
import { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DailyReservationData {
  start_date: string;
  end_date: string;
  count: number;
  date: string;
}

const chartConfig: ChartConfig = {
  desktop: {
    label: "Desktop",
    color: "#adfa1d",
  },
  mobile: {
    label: "Mobile",
    color: "#adfa1d",
  },
};

export default function DailyReservations({ userId }: { userId: string }) {
  const [dailyReservations, setDailyReservations] = useState<DailyReservationData[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<DailyReservationData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 10)
  });
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    console.log('Fetching data for userId:', userId);
    setError(null);

    try {
      let allReservations: DailyReservationData[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: reservations, error: reservationsError, count } = await supabase
          .from('reservations')
          .select('start_date, end_date')
          .eq('user_id', userId)
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (reservationsError) {
          throw reservationsError;
        }

        if (reservations && reservations.length > 0) {
          allReservations = [...allReservations, ...reservations];
        }

        hasMore = count !== null && allReservations.length < count;
        page++;
      }

      console.log('Total reservations fetched:', allReservations.length);
      console.log('Sample of fetched reservations:', allReservations.slice(0, 5));

      if (allReservations.length === 0) {
        console.log('No reservations found for this user');
        setDailyReservations([]);
        return;
      }

      const dailyData = allReservations.reduce((acc, reservation) => {
        if (!reservation.start_date || !reservation.end_date) {
          console.warn('Reservation without start_date or end_date:', reservation);
          return acc;
        }
        const startDate = new Date(reservation.start_date);
        const endDate = new Date(reservation.end_date);
        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
          const dateString = date.toISOString().split('T')[0];
          acc[dateString] = (acc[dateString] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Fill in missing days with 0 count
      const startDate = dateRange?.from ?? new Date(0);
      const endDate = dateRange?.to ?? new Date();
      const allDays = eachDayOfInterval({ start: startOfDay(startDate), end: endOfDay(endDate) });

      const dailyReservationsData = allDays.map(date => {
        const dateString = date.toISOString().split('T')[0];
        return {
          date: dateString,
          count: dailyData[dateString] || 0
        };
      });

      console.log('Formatted daily reservations data:', dailyReservationsData);
      console.log('Date range of reservations:', 
        dailyReservationsData[0]?.date, 
        'to', 
        dailyReservationsData[dailyReservationsData.length - 1]?.date
      );

      setDailyReservations(dailyReservationsData);
    } catch (error) {
      console.error('Error in fetchData:', error);
      setError('Failed to fetch reservation data. Please try again later.');
    }
  }, [userId, supabase, dateRange]);

  const filterDataByDateRange = useCallback(() => {
    console.log('Filtering data with date range:', dateRange);
    const filtered = dailyReservations.filter(item => {
      const itemDate = parseISO(item.date);
      const start = dateRange?.from ?? new Date(0);
      const end = dateRange?.to ?? new Date();
      const isWithin = isWithinInterval(itemDate, { start, end });
      console.log('Checking date:', item.date, 'isWithin:', isWithin);
      return isWithin;
    });
    console.log('Filtered reservations:', filtered);
    setFilteredReservations(filtered);
  }, [dailyReservations, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData, dateRange]);

  useEffect(() => {
    filterDataByDateRange();
  }, [filterDataByDateRange]);

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  return (
    <Card className='w-fit min-w-[600px]'>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-6'>
      <CardTitle>Daily Reservations</CardTitle>
      <DatePickerWithRange
        date={dateRange}
        setDate={handleDateRangeChange}
      />
    </CardHeader>
    <CardContent>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredReservations.length > 0 ? (
        <ChartContainer config={chartConfig} className="min-h-[200px]">
          <BarChart data={filteredReservations} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              tickFormatter={(value) => format(parseISO(value), 'MMM d')}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="#3b82f6" radius={4}/>
          </BarChart>
        </ChartContainer>
      ) : (
        <p>No daily reservation data available for the selected date range. UserId: {userId}</p>
      )}
      </CardContent>
    </Card>
  );
}

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import CarReservationTimeline from "@/components/Car-Reservation-Timeline";
import { AddReservationForm } from "@/components/Car-Reservation-Form";
import { getTeamName } from "@/lib/action";
import CalendarView from "@/components/Calendar-View";
export default async function Dashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 w-full">
      <Sidebar className="w-full md:w-64 flex-shrink-0"/>
      <div className="w-full flex justify-center h-full">
        <div className="w-full max-w-6xl flex flex-col px-3 py-6">
          <div className="flex justify-between items-center pb-6">
            <p className="text-xl md:text-2xl font-bold">
              Dashboard
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <CarReservationTimeline />
            <CalendarView />
          </div>
        </div>
      </div>
    </div>
  )
}
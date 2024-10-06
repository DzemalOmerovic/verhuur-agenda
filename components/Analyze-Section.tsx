"use client"

import DailyReservations from "@/components/charts/Daily-Reservations";

export default function AnalyzePage({ userId }: { userId: string }) {

  return (
    <div className="space-y-6">
      <DailyReservations userId={userId} />
    </div>
  );
}
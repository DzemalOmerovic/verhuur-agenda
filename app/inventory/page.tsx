import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import DropdownUser from "@/components/Dropdown-User";
import { AddCarModal} from "@/components/Add-Car-Dialog";
import { DisplayCars } from "@/components/Display-Cars";
import { MenuBarAgenda } from "@/components/Menu-Bar-Agenda";
import { Sidebar } from "@/components/Sidebar";

export default async function Inventory() {
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
          <div className="flex flex-col gap-4">
            <AddCarModal user={user} />
            <DisplayCars />
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
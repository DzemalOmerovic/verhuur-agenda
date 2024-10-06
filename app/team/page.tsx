import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import TeamManagement from "@/components/Team-Management";

export default async function TeamPage() {
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
              Team
            </p>
          </div>
          <TeamManagement userId={user.id}/>
        </div>
      </div>
    </div>
  )
}
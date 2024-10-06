import { createClient } from "@/lib/supabase/server";
import AuthButton from "@/components/Auth-Button";

export default async function Home() {
  const canInitSupabaseClient = () => {

    try {
      createClient();
      return true;
    } catch (e) {
      return false;
    }
  }

  const isSupabaseConnected = canInitSupabaseClient();

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-6xl flex justify-between items-center p-3 text-sm">
          Verhuur Agenda
          {isSupabaseConnected && <AuthButton />}
        </div>
      </nav> 
    </div>
  );
}
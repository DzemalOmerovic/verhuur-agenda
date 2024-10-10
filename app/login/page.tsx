import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { UserLoginForm } from "@/components/User-Login-Form";

export default function Login() {

  return (
    <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/signup"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
      >
        Registreer
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-800" />
        <Link href="/" className="relative z-20 flex items-center text-lg font-medium">
          Verhuur Agenda
        </Link>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Login om je agenda te bekijken
            </h1>
            <p className="text-sm text-muted-foreground">
              Vul je email en wachtwoord in om je agenda te bekijken
            </p>
          </div>
          <UserLoginForm />
        </div>
      </div>
    </div>
  )
}

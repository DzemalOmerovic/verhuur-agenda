"use client"

import * as React from "react"
import { z } from "zod"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/Icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { encodedRedirect } from "@/utils/utils";

import { logActivity } from "@/lib/logs/action";
import { ActivityType } from "@/lib/db/schema";

interface UserRegisterFormProps extends React.HTMLAttributes<HTMLDivElement> { }

export function UserRegisterForm({ className, ...props }: UserRegisterFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      confirmPassword: z.string().min(8),
    })

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error(authError.code + " " + authError.message);
      return encodedRedirect("error", "/signup", "Error trying to sign up");
    } else {

      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              role: 'owner'
            },
          ])

        if (userError) throw userError
      }

        // Create team
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .insert([
            { name: `${email}'s Team` }
          ])
          .select()

        if (teamError) throw teamError

        if (teamData && teamData[0]) {
          // Create team member
          const { error: teamMemberError } = await supabase
            .from('team_members')
            .insert([
              {
                user_id: authData.user?.id,
                team_id: teamData[0].id,
                role: 'owner'
              }
            ])

          if (teamMemberError) throw teamMemberError
        }

        if (authData.user) {
          logActivity(null, authData.user.id, ActivityType.SIGN_UP);
        }

      return encodedRedirect(
        "success",
        "/signup",
        "Thanks for signing up! Please check your email for a verification link.",
      );
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="confirm-password">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              name="confirm-password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <Button disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Registreren
          </Button>
        </div>
      </form>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Of registreer met
          </span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isLoading} onClick={() => {/* Implement Google sign-up */ }}>
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>
    </div>
  )
}
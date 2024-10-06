"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client";
import { getTeamID } from "@/lib/action";
import { User } from '@supabase/supabase-js'
import { useEffect } from 'react'

export function AddCarModal({ user }: { user: User }) {
  const [name, setName] = useState('')
  const [numberPlate, setNumberPlate] = useState('')
  const [mileage, setMileage] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'beschikbaar' | 'bezet' | 'reparatie'>('beschikbaar')
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [teamId, setTeamId] = useState<number | null>(null)

  const supabase = createClient();

  useEffect(() => {
    const fetchTeamId = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching team ID:', error);
        return;
      }

      setTeamId(data.team_id);
    };

    fetchTeamId();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      setMessage('Error: User not authenticated')
      return
    }

    const { data, error } = await supabase
      .from('cars')
      .insert([
        {
          user_id: userData.user.id,
          team_id: teamId,
          name,
          number_plate: numberPlate,
          mileage: parseInt(mileage),
          note: notes,
          status,
        },
      ])

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Car added successfully!')
      setName('')
      setNumberPlate('')
      setMileage('')
      setNotes('')
      setStatus('beschikbaar')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add New Car</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Car</DialogTitle>
          <DialogDescription>
            Enter the details of the new car here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numberPlate" className="text-right">
                Number Plate
              </Label>
              <Input
                id="numberPlate"
                value={numberPlate}
                onChange={(e) => setNumberPlate(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mileage" className="text-right">
                Mileage
              </Label>
              <Input
                id="mileage"
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select onValueChange={(value: 'beschikbaar' | 'bezet' | 'reparatie') => setStatus(value)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beschikbaar">Beschikbaar</SelectItem>
                  <SelectItem value="bezet">Bezet</SelectItem>
                  <SelectItem value="reparatie">Reparatie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </Dialog>
  )
}
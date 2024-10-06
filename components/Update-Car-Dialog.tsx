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
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type Car = {
  id: number
  name: string
  number_plate: string
  mileage: number
  notes: string | null
  status: 'beschikbaar' | 'bezet' | 'reparatie'
}

type UpdateCarDialogProps = {
  car: Car
  onUpdate: () => void
}

export function UpdateCarDialog({ car, onUpdate }: UpdateCarDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(car.name)
  const [numberPlate, setNumberPlate] = useState(car.number_plate)
  const [mileage, setMileage] = useState(car.mileage.toString())
  const [notes, setNotes] = useState(car.notes || '')
  const [status, setStatus] = useState<'beschikbaar' | 'bezet' | 'reparatie'>(car.status)

  const supabase = createClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data, error } = await supabase
      .from('car')
      .update({
        name,
        number_plate: numberPlate,
        mileage: parseInt(mileage),
        notes,
        status,
      })
      .eq('id', car.id)

    if (error) {
      toast({
        title: "Error",
        description: `Failed to update car: ${error.message}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Car updated successfully!",
      })
      setOpen(false)
      onUpdate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Car</DialogTitle>
          <DialogDescription>
            Make changes to the car details here. Click save when you're done.
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
              <Select onValueChange={(value: 'beschikbaar' | 'bezet' | 'reparatie') => setStatus(value)} defaultValue={status}>
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
    </Dialog>
  )
}
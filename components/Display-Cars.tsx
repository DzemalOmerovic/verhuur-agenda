"use client"

import { useEffect, useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UpdateCarDialog } from './Update-Car-Dialog'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Car = {
  id: number
  name: string
  number_plate: string
  mileage: number
  notes: string | null
  status: 'beschikbaar' | 'bezet' | 'reparatie'
}

export function DisplayCars() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const { toast } = useToast()

  const fetchCars = async () => {
    const { data, error } = await supabase
      .from('cars')
      .select('*')

    if (error) {
      setError('Could not fetch cars')
      setLoading(false)
    } else {
      setCars(data)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCars()
  }, [])

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('car')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: "Error",
        description: `Failed to delete car: ${error.message}`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Car deleted successfully!",
      })
      fetchCars()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'beschikbaar':
        return 'text-green-600'
      case 'bezet':
        return 'text-red-600'
      case 'reparatie':
        return 'text-orange-600'
      default:
        return ''
    }
  }

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  if (cars.length === 0) return <p className="text-center text-gray-500">Geen auto's gevonden</p>

  return (
    <Table>
      <TableCaption>Een lijst van jullie auto's.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Number Plate</TableHead>
          <TableHead>Mileage</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cars.map((car) => (
          <TableRow key={car.id}>
            <TableCell>{car.name}</TableCell>
            <TableCell>{car.number_plate}</TableCell>
            <TableCell>{car.mileage}</TableCell>
            <TableCell className={getStatusColor(car.status)}>{car.status.charAt(0).toUpperCase() + car.status.slice(1)}</TableCell>
            <TableCell>{car.notes}</TableCell>
            <TableCell>
              <UpdateCarDialog car={car} onUpdate={fetchCars} />
              <Button variant="destructive" onClick={() => handleDelete(car.id)} className="ml-2">Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
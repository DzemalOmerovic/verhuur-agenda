"use client"

import { useEffect, useState } from 'react'
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function CarSummary() {
  const [totalCars, setTotalCars] = useState(0)
  const [availableCars, setAvailableCars] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchCarSummary() {
      const { data: totalData, error: totalError } = await supabase
        .from('car')
        .select('id', { count: 'exact' })

      const { data: availableData, error: availableError } = await supabase
        .from('car')
        .select('id', { count: 'exact' })
        .eq('status', 'beschikbaar')

      if (totalError || availableError) {
        setError('Could not fetch car summary')
        setLoading(false)
      } else {
        setTotalCars(totalData.length)
        setAvailableCars(availableData.length)
        setLoading(false)
      }
    }

    fetchCarSummary()
  }, [])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="max-w-sm">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Overzicht Auto's
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground">Auto's</div>
              <div className="text-2xl font-bold">{totalCars}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Beschikbaar</div>
              <div className="text-2xl font-bold">{availableCars} <span className="text-sm text-muted-foreground">/ {totalCars}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
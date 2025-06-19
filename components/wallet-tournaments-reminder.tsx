"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Tournament {
  id: string
  title: string
  gameName: string
  gameCoverImage: string
  entryFee: number
}

interface WalletTournamentsReminderProps {
  walletBalance: number
}

export function WalletTournamentsReminder({ walletBalance }: WalletTournamentsReminderProps) {
  const [unaffordableTournaments, setUnaffordableTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/tournaments")
        if (!response.ok) {
          throw new Error("Failed to fetch tournaments")
        }
        const data = await response.json()

        // Filter tournaments that the user can't afford and aren't joined
        const unaffordable = data
          .filter((t: any) => !t.joined && t.entryFee > walletBalance)
          .sort((a: any, b: any) => a.entryFee - b.entryFee) // Sort by lowest entry fee first
          .slice(0, 3) // Take only the first 3

        setUnaffordableTournaments(unaffordable)
      } catch (error: any) {
        console.error("Error fetching tournaments:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [walletBalance])

  if (loading || error || unaffordableTournaments.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Tournaments You Could Join
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          Add funds to your wallet to participate in these upcoming tournaments:
        </p>
        <div className="space-y-3">
          {unaffordableTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border cursor-pointer"
              onClick={() => router.push(`/tournament/${tournament.id}`)}
            >
              <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={tournament.gameCoverImage || "/placeholder.svg?height=400&width=600"}
                  alt={tournament.gameName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{tournament.title}</h4>
                <p className="text-xs text-gray-500">{tournament.gameName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-red-600">${tournament.entryFee}</p>
                <p className="text-xs text-gray-500">{(tournament.entryFee - walletBalance).toFixed(2)} more needed</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" className="text-sm" onClick={() => router.push("/")}>
            View All Tournaments
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

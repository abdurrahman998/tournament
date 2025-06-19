"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, DollarSign, Users, AlertCircle } from "lucide-react"
import Image from "next/image"
import { formatDate, formatTime } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface TournamentCardProps {
  tournament: any
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const router = useRouter()
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuthAndFetchWallet = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setIsAuthenticated(true)
          const { data: walletData } = await fetch("/api/wallet").then((res) => {
            if (!res.ok) return { balance: 0 }
            return res.json()
          })

          if (walletData) {
            setWalletBalance(walletData.balance)
          }
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error)
      }
    }

    checkAuthAndFetchWallet()
  }, [supabase])

  const handleViewDetails = () => {
    router.push(`/tournament/${tournament.id}`)
  }

  const insufficientFunds = isAuthenticated && walletBalance !== null && walletBalance < tournament.entryFee

  return (
    <Card className="overflow-hidden">
      <div className="relative h-32">
        <Image
          src={tournament.gameCoverImage || "/placeholder.svg?height=400&width=600"}
          alt={tournament.gameName}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <Badge className="absolute top-2 left-2 bg-black/50 hover:bg-black/50">{tournament.gameName}</Badge>
        {tournament.joined && (
          <Badge variant="secondary" className="absolute top-2 right-2">
            Joined
          </Badge>
        )}
        {isAuthenticated && !tournament.joined && insufficientFunds && (
          <Badge variant="outline" className="absolute top-2 right-2 bg-amber-100 text-amber-800 border-amber-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Insufficient Funds
          </Badge>
        )}
      </div>
      <CardContent className="pt-3">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{tournament.title}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(new Date(tournament.startTime))}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(new Date(tournament.startTime))}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>
              {tournament.joinedPlayers}/{tournament.totalSlots} Players
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            <span>${tournament.entryFee} Entry</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Prize Pool</p>
            <p className="text-lg font-bold">${tournament.prizePool}</p>
          </div>
          <Button onClick={handleViewDetails}>View Details</Button>
        </div>
      </CardContent>
    </Card>
  )
}

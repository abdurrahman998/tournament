"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, DollarSign, Users, AlertCircle, Copy, Bell, BellOff, ArrowLeft } from "lucide-react"
import Image from "next/image"
import { mockTournaments } from "@/lib/mock-data"
import { formatDate, formatTime } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { TournamentFundingReminder } from "@/components/tournament-funding-reminder"

export default function TournamentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isReminded, setIsReminded] = useState(false)
  const [tournament, setTournament] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState(0)
  const [joining, setJoining] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchTournamentAndWallet = async () => {
      setLoading(true)
      try {
        // Get tournament data
        const { data: tournamentData, error: tournamentError } = await fetch(`/api/tournaments/${params.id}`).then(
          (res) => {
            if (!res.ok) throw new Error("Failed to fetch tournament")
            return res.json()
          },
        )

        if (tournamentError) throw tournamentError

        // Get wallet data
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: walletData, error: walletError } = await fetch("/api/wallet").then((res) => {
            if (!res.ok) return { balance: 0 }
            return res.json()
          })

          if (!walletError && walletData) {
            setWalletBalance(walletData.balance)
          }
        }

        setTournament(tournamentData)
      } catch (error) {
        console.error("Error fetching data:", error)
        // Fallback to mock data if API fails
        const mockTournament = mockTournaments.find((t) => t.id === params.id)
        setTournament(mockTournament || null)
      } finally {
        setLoading(false)
      }
    }

    fetchTournamentAndWallet()
  }, [params.id, supabase])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-gray-50">
        <MobileHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Loading tournament details...</h2>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
        <MobileNavigation />
      </main>
    )
  }

  if (!tournament) {
    return (
      <main className="flex min-h-screen flex-col bg-gray-50">
        <MobileHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Tournament Not Found</h2>
            <p className="text-gray-500 mb-4">The tournament you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/")}>Go Back Home</Button>
          </div>
        </div>
        <MobileNavigation />
      </main>
    )
  }

  const handleCopyRoomInfo = () => {
    if (tournament.roomId) {
      navigator.clipboard.writeText(`Room ID: ${tournament.roomId}, Password: ${tournament.roomPassword}`)
      toast({
        title: "Copied to clipboard",
        description: "Room ID and password copied to clipboard",
      })
    }
  }

  const handleToggleReminder = () => {
    setIsReminded(!isReminded)
    toast({
      title: isReminded ? "Reminder removed" : "Reminder set",
      description: isReminded
        ? "You will no longer be notified before this tournament"
        : "You will be notified 15 minutes before the tournament starts",
    })
  }

  const handleJoinTournament = async () => {
    setJoining(true)
    try {
      const response = await fetch(`/api/tournaments/${tournament.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "join" }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to join tournament")
      }

      toast({
        title: "Tournament joined",
        description: `$${tournament.entryFee} has been deducted from your wallet`,
      })

      // Refresh the page to show updated status
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setJoining(false)
    }
  }

  const insufficientFunds = walletBalance < tournament.entryFee

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Tournament Details</h1>
        </div>
      </div>

      <div className="flex-1 pb-20">
        <div className="relative h-48">
          <Image
            src={tournament.gameCoverImage || "/placeholder.svg"}
            alt={tournament.gameName}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <Badge className="absolute top-4 left-4 bg-black/50 hover:bg-black/50">{tournament.gameName}</Badge>
          {tournament.joined && (
            <Badge variant="secondary" className="absolute top-4 right-4">
              Joined
            </Badge>
          )}
        </div>

        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">{tournament.title}</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(new Date(tournament.startTime))}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(new Date(tournament.startTime))}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {tournament.joinedPlayers}/{tournament.totalSlots} Players
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>${tournament.entryFee} Entry</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Prize Pool</span>
              <span className="text-2xl font-bold text-green-600">${tournament.prizePool}</span>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
              <TabsTrigger value="prizes">Prizes</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{tournament.description}</p>
              </div>

              {tournament.joined && tournament.roomId && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-blue-900">Room Information</h4>
                    <Button variant="outline" size="sm" onClick={handleCopyRoomInfo}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-sm text-blue-700">Room ID:</span>
                      <p className="font-mono font-medium">{tournament.roomId}</p>
                    </div>
                    <div>
                      <span className="text-sm text-blue-700">Password:</span>
                      <p className="font-mono font-medium">{tournament.roomPassword}</p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rules">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-3">Tournament Rules</h3>
                <ul className="space-y-2">
                  {Array.isArray(tournament.rules) ? (
                    tournament.rules.map((rule: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary font-medium">{index + 1}.</span>
                        <span className="text-gray-600">{rule}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-600">No rules specified for this tournament.</li>
                  )}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="prizes">
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-3">Prize Distribution</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <span className="font-medium">First Place</span>
                    </div>
                    <span className="font-bold text-yellow-600">${Math.round(tournament.prizePool * 0.6)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <span className="font-medium">Second Place</span>
                    </div>
                    <span className="font-bold text-gray-600">${Math.round(tournament.prizePool * 0.3)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <span className="font-medium">Third Place</span>
                    </div>
                    <span className="font-bold text-orange-600">${Math.round(tournament.prizePool * 0.1)}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-3">
            {tournament.joined ? (
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleToggleReminder}>
                  {isReminded ? (
                    <>
                      <BellOff className="h-4 w-4 mr-2" />
                      Remove Reminder
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" />
                      Set Reminder
                    </>
                  )}
                </Button>
                <Button variant="destructive" className="flex-1">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Leave Tournament
                </Button>
              </div>
            ) : (
              <>
                {insufficientFunds ? (
                  <div className="space-y-3">
                    <TournamentFundingReminder
                      entryFee={tournament.entryFee}
                      currentBalance={walletBalance}
                      tournamentName={tournament.title}
                    />
                    <Button onClick={handleJoinTournament} className="w-full" size="lg" disabled={true}>
                      Join Tournament (${tournament.entryFee})
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleJoinTournament} className="w-full" size="lg" disabled={joining}>
                    {joining ? "Joining..." : `Join Tournament ($${tournament.entryFee})`}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <MobileNavigation />
    </main>
  )
}

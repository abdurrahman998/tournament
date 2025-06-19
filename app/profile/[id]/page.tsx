import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Trophy, Users, Wallet } from "lucide-react"

interface PlayerProfileProps {
  params: {
    id: string
  }
}

export default async function PlayerProfile({ params }: PlayerProfileProps) {
  const supabase = createClient()

  // Fetch user profile
  const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", params.id).single()

  if (userError || !user) {
    notFound()
  }

  // Fetch user's tournament participations
  const { data: participations } = await supabase
    .from("tournament_participants")
    .select(`
      *,
      tournaments (
        id,
        title,
        game,
        status,
        start_date,
        entry_fee
      )
    `)
    .eq("user_id", params.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const totalTournaments = participations?.length || 0
  const activeTournaments = participations?.filter((p) => p.tournaments?.status === "active").length || 0

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.username} />
              <AvatarFallback className="text-lg">
                {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.username || "Anonymous Player"}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Wallet className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">${user.wallet_balance || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tournaments</p>
                <p className="text-2xl font-bold">{totalTournaments}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Tournaments</p>
                <p className="text-2xl font-bold">{activeTournaments}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold">${user.wallet_balance || 0}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament History */}
      <Card>
        <CardHeader>
          <CardTitle>Tournament History</CardTitle>
        </CardHeader>
        <CardContent>
          {participations && participations.length > 0 ? (
            <div className="space-y-4">
              {participations.map((participation) => (
                <div
                  key={participation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{participation.tournaments?.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{participation.tournaments?.game}</Badge>
                      <span className="text-sm text-gray-600">${participation.tournaments?.entry_fee} entry fee</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        participation.tournaments?.status === "active"
                          ? "default"
                          : participation.tournaments?.status === "completed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {participation.tournaments?.status}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {participation.tournaments?.start_date &&
                        new Date(participation.tournaments.start_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No tournament history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

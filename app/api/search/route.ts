import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const searchQuery = searchParams.get("q")

  if (!searchQuery) {
    return NextResponse.json([])
  }

  const url = new URL(request.url)
  const searchType = url.searchParams.get("type")

  const results: any[] = []

  if (searchType === "tournaments") {
    // Only search tournaments
    const { data: tournaments, error: tournamentsError } = await supabase
      .from("tournaments")
      .select("id, title, game, entry_fee, max_participants, current_participants, prize_pool, status")
      .or(`title.ilike.%${searchQuery}%,game.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .limit(8)

    if (!tournamentsError && tournaments) {
      results.push(
        ...tournaments.map((tournament) => ({
          type: "tournament",
          id: tournament.id,
          title: tournament.title,
          subtitle: `${tournament.game} • ${tournament.current_participants}/${tournament.max_participants} players`,
          description: `Entry: $${tournament.entry_fee} • Prize: $${tournament.prize_pool}`,
          badge: tournament.game,
          status: tournament.status,
        })),
      )
    }
  } else {
    const { data: users, error: usersError } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .ilike("username", `%${searchQuery}%`)
      .limit(5)

    if (!usersError && users) {
      results.push(
        ...users.map((user) => ({
          type: "user",
          id: user.id,
          title: user.username,
          subtitle: user.full_name,
          avatarUrl: user.avatar_url,
        })),
      )
    }

    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, name")
      .ilike("name", `%${searchQuery}%`)
      .limit(5)

    if (!gamesError && games) {
      results.push(
        ...games.map((game) => ({
          type: "game",
          id: game.id,
          title: game.name,
        })),
      )
    }

    const { data: tournaments, error: tournamentsError } = await supabase
      .from("tournaments")
      .select("id, title, game, entry_fee, max_participants, current_participants, prize_pool, status")
      .or(`title.ilike.%${searchQuery}%,game.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
      .limit(3)

    if (!tournamentsError && tournaments) {
      results.push(
        ...tournaments.map((tournament) => ({
          type: "tournament",
          id: tournament.id,
          title: tournament.title,
          subtitle: `${tournament.game} • ${tournament.current_participants}/${tournament.max_participants} players`,
          description: `Entry: $${tournament.entry_fee} • Prize: $${tournament.prize_pool}`,
          badge: tournament.game,
          status: tournament.status,
        })),
      )
    }
  }

  return NextResponse.json(results)
}

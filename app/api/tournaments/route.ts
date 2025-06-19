import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const game = searchParams.get("game")
  const sortBy = searchParams.get("sortBy")
  const maxFee = searchParams.get("maxFee")
  const featured = searchParams.get("featured") === "true"

  const supabase = createRouteHandlerClient({ cookies })

  let query = supabase.from("tournaments").select(`
    id,
    title,
    game_name,
    game_cover_image,
    description,
    rules,
    start_time,
    total_slots,
    entry_fee,
    prize_pool,
    room_id,
    room_password,
    status,
    tournament_participants(user_id)
  `)

  // Apply filters
  if (game) {
    query = query.eq("game_name", game)
  }

  if (maxFee) {
    const fee = maxFee === "free" ? 0 : Number.parseInt(maxFee)
    query = query.lte("entry_fee", fee)
  }

  // Get the data
  const { data: tournaments, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If no tournaments found, return empty array
  if (!tournaments || tournaments.length === 0) {
    return NextResponse.json([])
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Process the data
  const processedTournaments = tournaments.map((tournament) => {
    // Count participants
    const joinedPlayers = tournament.tournament_participants.length

    // Check if current user is joined
    const joined = user ? tournament.tournament_participants.some((p) => p.user_id === user.id) : false

    // Don't expose room details unless the user is joined
    const roomId = joined ? tournament.room_id : null
    const roomPassword = joined ? tournament.room_password : null

    // Format the data to match our frontend model
    return {
      id: tournament.id,
      title: tournament.title,
      gameName: tournament.game_name,
      gameCoverImage: tournament.game_cover_image,
      description: tournament.description,
      rules: tournament.rules,
      startTime: tournament.start_time,
      joinedPlayers,
      totalSlots: tournament.total_slots,
      entryFee: tournament.entry_fee,
      prizePool: tournament.prize_pool,
      joined,
      roomId,
      roomPassword,
      status: tournament.status,
    }
  })

  // Apply sorting
  if (sortBy) {
    switch (sortBy) {
      case "time-asc":
        processedTournaments.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        break
      case "time-desc":
        processedTournaments.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
        break
      case "prize-asc":
        processedTournaments.sort((a, b) => a.prizePool - b.prizePool)
        break
      case "prize-desc":
        processedTournaments.sort((a, b) => b.prizePool - a.prizePool)
        break
      case "slots":
        processedTournaments.sort((a, b) => b.totalSlots - b.joinedPlayers - (a.totalSlots - a.joinedPlayers))
        break
    }
  }

  // If featured parameter is true, sort by prize pool and return
  if (featured) {
    processedTournaments.sort((a, b) => b.prizePool - a.prizePool)
  }

  return NextResponse.json(processedTournaments)
}

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const supabase = createRouteHandlerClient({ cookies })

  // Get the tournament
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select(`
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
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Count participants
  const joinedPlayers = tournament.tournament_participants.length

  // Check if current user is joined
  const joined = user ? tournament.tournament_participants.some((p) => p.user_id === user.id) : false

  // Don't expose room details unless the user is joined
  const roomId = joined ? tournament.room_id : null
  const roomPassword = joined ? tournament.room_password : null

  // Format the data to match our frontend model
  const processedTournament = {
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

  return NextResponse.json(processedTournament)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const { action } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Get the tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, entry_fee, total_slots")
    .eq("id", id)
    .single()

  if (tournamentError) {
    return NextResponse.json({ error: tournamentError.message }, { status: 404 })
  }

  // Get current participants count
  const { count, error: countError } = await supabase
    .from("tournament_participants")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", id)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  // Check if tournament is full
  if (count && count >= tournament.total_slots) {
    return NextResponse.json({ error: "Tournament is full" }, { status: 400 })
  }

  // Get user wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single()

  if (walletError) {
    return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
  }

  // Check if user has enough balance
  if (wallet.balance < tournament.entry_fee) {
    return NextResponse.json(
      {
        error: `Insufficient funds. You need $${tournament.entry_fee} to join this tournament. Your current balance is $${wallet.balance}.`,
        insufficientFunds: true,
        requiredAmount: tournament.entry_fee,
        currentBalance: wallet.balance,
      },
      { status: 400 },
    )
  }

  // Start a transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      amount: tournament.entry_fee,
      type: "tournament_entry",
      status: "pending",
      description: `Entry fee for tournament: ${id}`,
      tournament_id: id,
    })
    .select()
    .single()

  if (transactionError) {
    return NextResponse.json({ error: transactionError.message }, { status: 500 })
  }

  // Join the tournament
  const { error: joinError } = await supabase.from("tournament_participants").insert({
    tournament_id: id,
    user_id: user.id,
    transaction_id: transaction.id,
  })

  if (joinError) {
    // Rollback by cancelling the transaction
    await supabase.from("transactions").update({ status: "cancelled" }).eq("id", transaction.id)

    return NextResponse.json({ error: joinError.message }, { status: 500 })
  }

  // Complete the transaction
  const { error: completeError } = await supabase
    .from("transactions")
    .update({ status: "completed" })
    .eq("id", transaction.id)

  if (completeError) {
    return NextResponse.json({ error: completeError.message }, { status: 500 })
  }

  // Create a notification
  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Tournament Joined",
    message: `You have successfully joined the tournament. Entry fee of $${tournament.entry_fee} has been deducted from your wallet.`,
    type: "tournament",
    tournament_id: id,
  })

  return NextResponse.json({ success: true, message: "Successfully joined tournament" })
}

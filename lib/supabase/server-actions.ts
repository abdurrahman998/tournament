"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Database } from "@/lib/supabase/database.types"

// Create a server action client for Supabase
const createClient = () => {
  return createServerActionClient<Database>({ cookies })
}

// Tournament actions
export async function joinTournament(tournamentId: string) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Authentication required" }
  }

  // Get the tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id, entry_fee, total_slots")
    .eq("id", tournamentId)
    .single()

  if (tournamentError) {
    return { error: tournamentError.message }
  }

  // Get current participants count
  const { count, error: countError } = await supabase
    .from("tournament_participants")
    .select("*", { count: "exact", head: true })
    .eq("tournament_id", tournamentId)

  if (countError) {
    return { error: countError.message }
  }

  // Check if tournament is full
  if (count && count >= tournament.total_slots) {
    return { error: "Tournament is full" }
  }

  // Get user wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single()

  if (walletError) {
    return { error: "Wallet not found" }
  }

  // Check if user has enough balance
  if (wallet.balance < tournament.entry_fee) {
    return {
      error: `Insufficient funds. You need $${tournament.entry_fee} to join this tournament. Your current balance is $${wallet.balance}.`,
      insufficientFunds: true,
      requiredAmount: tournament.entry_fee,
      currentBalance: wallet.balance,
    }
  }

  // Start a transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      amount: tournament.entry_fee,
      type: "tournament_entry",
      status: "pending",
      description: `Entry fee for tournament: ${tournamentId}`,
      tournament_id: tournamentId,
    })
    .select()
    .single()

  if (transactionError) {
    return { error: transactionError.message }
  }

  // Join the tournament
  const { error: joinError } = await supabase.from("tournament_participants").insert({
    tournament_id: tournamentId,
    user_id: user.id,
    transaction_id: transaction.id,
  })

  if (joinError) {
    // Rollback by cancelling the transaction
    await supabase.from("transactions").update({ status: "cancelled" }).eq("id", transaction.id)

    return { error: joinError.message }
  }

  // Complete the transaction
  const { error: completeError } = await supabase
    .from("transactions")
    .update({ status: "completed" })
    .eq("id", transaction.id)

  if (completeError) {
    return { error: completeError.message }
  }

  // Create a notification
  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Tournament Joined",
    message: `You have successfully joined the tournament. Entry fee of $${tournament.entry_fee} has been deducted from your wallet.`,
    type: "tournament",
    tournament_id: tournamentId,
  })

  // Revalidate the tournament page to reflect changes
  revalidatePath(`/tournament/${tournamentId}`)
  revalidatePath("/")

  return { success: true, message: "Successfully joined tournament" }
}

// Wallet actions
export async function addFunds(amount: number, phoneNumber: string, transactionId: string) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Authentication required" }
  }

  // Create a pending deposit transaction
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      amount: amount,
      type: "deposit",
      status: "pending",
      description: `Deposit from ${phoneNumber}`,
      reference_id: transactionId,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Create a notification
  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Deposit Request Received",
    message: `Your deposit request of $${amount} has been received and is being processed.`,
    type: "payment",
  })

  // Revalidate the wallet page
  revalidatePath("/wallet")

  return {
    success: true,
    message: "Deposit request submitted successfully",
    transactionId: data.id,
  }
}

export async function withdrawFunds(amount: number, phoneNumber: string) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Authentication required" }
  }

  // Get the wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single()

  if (walletError) {
    return { error: "Wallet not found" }
  }

  // Check if user has enough balance
  if (wallet.balance < amount) {
    return { error: "Insufficient funds" }
  }

  // Create a pending withdrawal transaction
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      amount: amount,
      type: "withdrawal",
      status: "pending",
      description: `Withdrawal to ${phoneNumber}`,
      reference_id: null,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Create a notification
  await supabase.from("notifications").insert({
    user_id: user.id,
    title: "Withdrawal Request Received",
    message: `Your withdrawal request of $${amount} has been received and is being processed.`,
    type: "payment",
  })

  // Revalidate the wallet page
  revalidatePath("/wallet")

  return {
    success: true,
    message: "Withdrawal request submitted successfully",
    transactionId: data.id,
  }
}

// Profile actions
export async function updateProfile(profileData: {
  username?: string
  fullName?: string
  bio?: string
  steamId?: string
  epicGamesId?: string
  riotId?: string
}) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Authentication required" }
  }

  // Update the profile
  const { data, error } = await supabase
    .from("profiles")
    .update({
      username: profileData.username,
      full_name: profileData.fullName,
      bio: profileData.bio,
      steam_id: profileData.steamId,
      epic_games_id: profileData.epicGamesId,
      riot_id: profileData.riotId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Revalidate the profile page
  revalidatePath("/profile")

  return { success: true, data }
}

// Notification actions
export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Authentication required" }
  }

  // Update notification
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

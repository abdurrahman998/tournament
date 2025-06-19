import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Get the wallet
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (walletError) {
    // If wallet doesn't exist, create one
    if (walletError.code === "PGRST116") {
      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert({ user_id: user.id, balance: 0 })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      return NextResponse.json({
        balance: newWallet.balance,
        transactions: [],
      })
    }

    return NextResponse.json({ error: walletError.message }, { status: 404 })
  }

  // Get transactions
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select(`
      id,
      amount,
      type,
      status,
      description,
      created_at,
      tournaments(title, game_name)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (transactionsError) {
    return NextResponse.json({ error: transactionsError.message }, { status: 500 })
  }

  // Format transactions
  const formattedTransactions = transactions
    ? transactions.map((transaction) => {
        return {
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          status: transaction.status,
          description: transaction.description,
          date: transaction.created_at,
          game: transaction.tournaments?.game_name || null,
          tournamentTitle: transaction.tournaments?.title || null,
        }
      })
    : []

  return NextResponse.json({
    balance: wallet.balance,
    transactions: formattedTransactions,
  })
}

export async function POST(request: Request) {
  const { action, amount, phoneNumber, transactionId } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  if (action === "add") {
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create a notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Deposit Request Received",
      message: `Your deposit request of $${amount} has been received and is being processed.`,
      type: "payment",
    })

    return NextResponse.json({
      success: true,
      message: "Deposit request submitted successfully",
      transactionId: data.id,
    })
  } else if (action === "withdraw") {
    // Get the wallet
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single()

    if (walletError) {
      return NextResponse.json({ error: walletError.message }, { status: 404 })
    }

    // Check if user has enough balance
    if (wallet.balance < amount) {
      return NextResponse.json({ error: "Insufficient funds" }, { status: 400 })
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create a notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Withdrawal Request Received",
      message: `Your withdrawal request of $${amount} has been received and is being processed.`,
      type: "payment",
    })

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      transactionId: data.id,
    })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}

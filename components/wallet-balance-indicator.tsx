"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function WalletBalanceIndicator() {
  const [lowBalance, setLowBalance] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkWalletAndTournaments = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        // Get wallet balance
        const walletResponse = await fetch("/api/wallet")
        if (!walletResponse.ok) {
          setLoading(false)
          return
        }

        const walletData = await walletResponse.json()
        const balance = walletData.balance

        // Get tournaments
        const tournamentsResponse = await fetch("/api/tournaments")
        if (!tournamentsResponse.ok) {
          setLoading(false)
          return
        }

        const tournaments = await tournamentsResponse.json()

        // Check if there are any tournaments the user can't afford
        const unaffordableTournaments = tournaments.filter((t: any) => !t.joined && t.entryFee > balance)

        setLowBalance(unaffordableTournaments.length > 0)
      } catch (error) {
        console.error("Error checking wallet balance:", error)
      } finally {
        setLoading(false)
      }
    }

    checkWalletAndTournaments()
  }, [supabase])

  if (loading || !lowBalance) {
    return null
  }

  return (
    <div className="absolute -top-1 -right-1 h-3 w-3">
      <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-75"></div>
      <div className="relative h-full w-full bg-amber-500 rounded-full"></div>
    </div>
  )
}

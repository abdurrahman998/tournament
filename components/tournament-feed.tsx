"use client"

import { useState, useEffect } from "react"
import { TournamentCard } from "@/components/tournament-card"
import { WalletFundingReminder } from "@/components/wallet-funding-reminder"
import { createClient } from "@/lib/supabase/client"
import { EmptyState } from "@/components/empty-state"
import { Loader2 } from "lucide-react"

interface TournamentFeedProps {
  filterMine?: boolean
}

export default function TournamentFeed({ filterMine = false }: TournamentFeedProps) {
  const [tournaments, setTournaments] = useState<any[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<any[]>([])
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [showReminder, setShowReminder] = useState(true)
  const [unaffordableTournaments, setUnaffordableTournaments] = useState<{ count: number; minFee: number }>({
    count: 0,
    minFee: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/tournaments")
        if (!response.ok) {
          throw new Error("Failed to fetch tournaments")
        }
        const data = await response.json()
        setTournaments(data)
        setFilteredTournaments(data)
      } catch (error: any) {
        console.error("Error fetching tournaments:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    const fetchWalletBalance = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const response = await fetch("/api/wallet")
          if (response.ok) {
            const data = await response.json()
            setWalletBalance(data.balance)
          }
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error)
      }
    }

    fetchTournaments()
    fetchWalletBalance()
  }, [supabase])

  useEffect(() => {
    // Check for unaffordable tournaments when wallet balance or tournaments change
    if (walletBalance !== null) {
      const unaffordable = filteredTournaments.filter((t) => !t.joined && t.entryFee > walletBalance)

      if (unaffordable.length > 0) {
        // Find the minimum entry fee among unaffordable tournaments
        const minFee = Math.min(...unaffordable.map((t) => t.entryFee))
        setUnaffordableTournaments({
          count: unaffordable.length,
          minFee,
        })
      } else {
        setUnaffordableTournaments({ count: 0, minFee: 0 })
      }
    }
  }, [walletBalance, filteredTournaments])

  useEffect(() => {
    const handleFiltersChanged = (event: any) => {
      const filters = event.detail
      applyFilters(filters)
    }

    window.addEventListener("filtersChanged", handleFiltersChanged)
    return () => window.removeEventListener("filtersChanged", handleFiltersChanged)
  }, [tournaments])

  const applyFilters = (filters: any) => {
    let filtered = [...tournaments]

    // Apply game filter
    if (filters.game) {
      filtered = filtered.filter((t) => t.gameName.toLowerCase() === filters.game.toLowerCase())
    }

    // Apply max fee filter
    if (filters.maxFee) {
      const maxFee = filters.maxFee === "free" ? 0 : Number.parseInt(filters.maxFee)
      filtered = filtered.filter((t) => t.entryFee <= maxFee)
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "time-asc":
          filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          break
        case "time-desc":
          filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
          break
        case "prize-asc":
          filtered.sort((a, b) => a.prizePool - b.prizePool)
          break
        case "prize-desc":
          filtered.sort((a, b) => b.prizePool - a.prizePool)
          break
        case "slots":
          filtered.sort((a, b) => b.totalSlots - b.joinedPlayers - (a.totalSlots - a.joinedPlayers))
          break
      }
    }

    setFilteredTournaments(filtered)
  }

  // Filter tournaments if needed
  const displayedTournaments = filterMine ? filteredTournaments.filter((t) => t.joined) : filteredTournaments

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-gray-500">Loading tournaments...</p>
      </div>
    )
  }

  if (error) {
    return <EmptyState type="error" message={`Error loading tournaments: ${error}`} />
  }

  if (displayedTournaments.length === 0) {
    return (
      <EmptyState
        type={filterMine ? "my-tournaments" : "tournaments"}
        message={
          filterMine
            ? "You haven't joined any tournaments yet."
            : "No tournaments match your current filters or are available."
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Show reminder only if user is logged in, has unaffordable tournaments, and hasn't dismissed it */}
      {walletBalance !== null && unaffordableTournaments.count > 0 && showReminder && !filterMine && (
        <WalletFundingReminder
          minEntryFee={unaffordableTournaments.minFee}
          tournamentCount={unaffordableTournaments.count}
          onDismiss={() => setShowReminder(false)}
        />
      )}

      {displayedTournaments.map((tournament) => (
        <TournamentCard key={tournament.id} tournament={tournament} />
      ))}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Users, DollarSign, Loader2 } from "lucide-react"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function FeaturedCarousel() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [featuredTournaments, setFeaturedTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedTournaments = async () => {
      try {
        setLoading(true)
        // Use regular tournaments endpoint without the featured parameter
        // We'll sort by prize pool on the client side
        const response = await fetch("/api/tournaments")
        if (!response.ok) {
          throw new Error("Failed to fetch tournaments")
        }
        const data = await response.json()

        // Sort by prize pool and take top 3
        const featured = data.sort((a: any, b: any) => b.prizePool - a.prizePool).slice(0, 3)
        setFeaturedTournaments(featured)
      } catch (error: any) {
        console.error("Error fetching featured tournaments:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedTournaments()
  }, [])

  const nextSlide = () => {
    if (featuredTournaments.length <= 1) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredTournaments.length)
  }

  const prevSlide = () => {
    if (featuredTournaments.length <= 1) return
    setCurrentIndex((prevIndex) => (prevIndex - 1 + featuredTournaments.length) % featuredTournaments.length)
  }

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (featuredTournaments.length > 1) {
      const interval = setInterval(nextSlide, 5000)
      return () => clearInterval(interval)
    }
  }, [featuredTournaments.length])

  const handleViewDetails = (tournamentId: string) => {
    router.push(`/tournament/${tournamentId}`)
  }

  if (loading) {
    return (
      <div className="mb-6 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || featuredTournaments.length === 0) {
    // Return null to hide the carousel if there's an error or no tournaments
    return null
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">🔥 Featured Tournaments</h2>
        <div className="flex gap-1">
          {featuredTournaments.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-primary" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <Card className="overflow-hidden">
          <div className="relative h-48">
            <Image
              src={featuredTournaments[currentIndex]?.gameCoverImage || "/placeholder.svg?height=400&width=600"}
              alt={featuredTournaments[currentIndex]?.gameName || "Tournament"}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Navigation Buttons */}
            {featuredTournaments.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
                  onClick={prevSlide}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
                  onClick={nextSlide}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/90 hover:bg-primary/90">
                  {featuredTournaments[currentIndex]?.gameName || "Game"}
                </Badge>
                <Badge variant="secondary" className="bg-yellow-500/90 text-yellow-900 hover:bg-yellow-500/90">
                  Featured
                </Badge>
              </div>
              <h3 className="font-bold text-lg mb-2 line-clamp-1">
                {featuredTournaments[currentIndex]?.title || "Tournament"}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">
                    {featuredTournaments[currentIndex]?.startTime
                      ? formatDate(new Date(featuredTournaments[currentIndex].startTime))
                      : "TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">
                    {featuredTournaments[currentIndex]?.joinedPlayers || 0}/
                    {featuredTournaments[currentIndex]?.totalSlots || 0}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className="text-xs font-bold">${featuredTournaments[currentIndex]?.prizePool || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* View Details Button */}
        <div className="absolute bottom-4 right-4">
          <Button
            size="sm"
            onClick={() => handleViewDetails(featuredTournaments[currentIndex]?.id)}
            className="bg-primary hover:bg-primary/90"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  )
}

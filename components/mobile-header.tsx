"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { UserAuthForm } from "@/components/auth/user-auth-form"
import { FilterSheet } from "@/components/filter-sheet"
import { useRouter } from "next/navigation"

export function MobileHeader() {
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length > 1) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=tournaments`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.results || [])
          setShowResults(true)
        }
      } catch (error) {
        console.error("Error searching tournaments:", error)
      } finally {
        setIsLoading(false)
      }
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }

  const handleSearchSelect = (tournament: any) => {
    setSearchQuery(tournament.title)
    setShowResults(false)
    setSearchVisible(false)
    router.push(`/tournament/${tournament.id}`)
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {searchVisible ? (
          <div className="flex-1 flex items-center relative">
            <div className="flex-1 relative">
              <Input
                placeholder="Search tournaments..."
                className="flex-1"
                autoFocus
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
              />
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-80 overflow-y-auto z-50">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                      <span className="text-sm mt-2 block">Searching tournaments...</span>
                    </div>
                  ) : (
                    <>
                      {searchResults.map((tournament) => (
                        <div
                          key={tournament.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSearchSelect(tournament)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {tournament.badge}
                                </Badge>
                                <span className="font-medium text-sm">{tournament.title}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{tournament.subtitle}</span>
                              </div>
                            </div>
                            <Badge variant="default">Tournament</Badge>
                          </div>
                        </div>
                      ))}
                      <div className="p-3 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            router.push("/tournaments")
                            setSearchVisible(false)
                            setSearchQuery("")
                            setShowResults(false)
                          }}
                        >
                          View All Tournaments
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {showResults && searchResults.length === 0 && searchQuery.length > 1 && !isLoading && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg mt-1 z-50">
                  <div className="p-4 text-center text-gray-500">
                    <span className="text-sm">No tournaments found for "{searchQuery}"</span>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push("/tournaments")
                          setSearchVisible(false)
                          setSearchQuery("")
                          setShowResults(false)
                        }}
                      >
                        Browse All Tournaments
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchVisible(false)
                setSearchQuery("")
                setShowResults(false)
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold">GameTourneys</h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setSearchVisible(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <FilterSheet />
              <UserAuthForm />
            </div>
          </>
        )}
      </div>
    </header>
  )
}

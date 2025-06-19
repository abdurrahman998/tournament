"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

export function FilterSheet() {
  const [filters, setFilters] = useState({
    game: "",
    sortBy: "",
    maxFee: "",
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    // This would typically update a global state or call a parent function
    console.log("Applying filters:", filters)
    // You can emit an event or use a context to update the tournament list
    window.dispatchEvent(new CustomEvent("filtersChanged", { detail: filters }))
  }

  const resetFilters = () => {
    setFilters({ game: "", sortBy: "", maxFee: "" })
    window.dispatchEvent(new CustomEvent("filtersChanged", { detail: { game: "", sortBy: "", maxFee: "" } }))
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Filter className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Filter Tournaments</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="game">Game</Label>
            <Select value={filters.game} onValueChange={(value) => handleFilterChange("game", value)}>
              <SelectTrigger id="game">
                <SelectValue placeholder="Select game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fortnite">Fortnite</SelectItem>
                <SelectItem value="valorant">Valorant</SelectItem>
                <SelectItem value="csgo">CS:GO</SelectItem>
                <SelectItem value="apex">Apex Legends</SelectItem>
                <SelectItem value="cod">Call of Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">Sort By</Label>
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
              <SelectTrigger id="sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time-asc">Time (Soonest)</SelectItem>
                <SelectItem value="time-desc">Time (Latest)</SelectItem>
                <SelectItem value="prize-asc">Prize (Low to High)</SelectItem>
                <SelectItem value="prize-desc">Prize (High to Low)</SelectItem>
                <SelectItem value="slots">Available Slots</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee">Max Entry Fee</Label>
            <Select value={filters.maxFee} onValueChange={(value) => handleFilterChange("maxFee", value)}>
              <SelectTrigger id="fee">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="5">$5 or less</SelectItem>
                <SelectItem value="10">$10 or less</SelectItem>
                <SelectItem value="25">$25 or less</SelectItem>
                <SelectItem value="50">$50 or less</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4 flex justify-between">
            <Button variant="outline" onClick={resetFilters}>
              Reset
            </Button>
            <Button onClick={applyFilters}>Apply Filters</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

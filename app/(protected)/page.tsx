import TournamentFeed from "@/components/tournament-feed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { FeaturedCarousel } from "@/components/featured-carousel"
import { Suspense } from "react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <MobileHeader />
      <div className="flex-1 p-4 pb-20">
        <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-lg mb-6"></div>}>
          <FeaturedCarousel />
        </Suspense>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All Tournaments</TabsTrigger>
            <TabsTrigger value="my">My Tournaments</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
              <TournamentFeed />
            </Suspense>
          </TabsContent>
          <TabsContent value="my">
            <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>}>
              <TournamentFeed filterMine={true} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
      <MobileNavigation />
    </main>
  )
}

import TournamentFeed from "@/components/tournament-feed"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { FeaturedCarousel } from "@/components/featured-carousel"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <MobileHeader />
      <div className="flex-1 p-4 pb-20">
        <FeaturedCarousel />
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="all">All Tournaments</TabsTrigger>
            <TabsTrigger value="my">My Tournaments</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <TournamentFeed />
          </TabsContent>
          <TabsContent value="my">
            <TournamentFeed filterMine={true} />
          </TabsContent>
        </Tabs>
      </div>
      <MobileNavigation />
    </main>
  )
}

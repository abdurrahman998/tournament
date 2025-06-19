"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Edit, Settings, Trophy, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/profile")
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }
        const data = await response.json()
        setProfile(data)
      } catch (error: any) {
        console.error("Error fetching profile:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-gray-50">
        <MobileHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-lg font-medium">Loading profile...</h2>
          </div>
        </div>
        <MobileNavigation />
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen flex-col bg-gray-50">
        <MobileHeader />
        <div className="flex-1 p-4">
          <EmptyState type="error" message={`Error loading profile: ${error}`} />
        </div>
        <MobileNavigation />
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <MobileHeader />
      <div className="flex-1 p-4 pb-20">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt="Profile" />
              <AvatarFallback>{profile.username ? profile.username.charAt(0).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
            <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="mt-4 text-xl font-bold">{profile.full_name || "User"}</h2>
          <p className="text-gray-500">@{profile.username || "username"}</p>
          <div className="flex gap-4 mt-4">
            <div className="text-center">
              <p className="font-bold">{profile.tournaments_played || 0}</p>
              <p className="text-xs text-gray-500">Tournaments</p>
            </div>
            <div className="text-center">
              <p className="font-bold">{profile.tournaments_won || 0}</p>
              <p className="text-xs text-gray-500">Wins</p>
            </div>
            <div className="text-center">
              <p className="font-bold">${profile.total_earnings || 0}</p>
              <p className="text-xs text-gray-500">Earnings</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 w-full">
            <Button variant="outline" className="flex-1">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="outline" className="flex-1">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="achievements">Awards</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Game Statistics</CardTitle>
                <CardDescription>Your performance across different games</CardDescription>
              </CardHeader>
              <CardContent>
                {profile.game_stats && profile.game_stats.length > 0 ? (
                  <div className="space-y-4">
                    {profile.game_stats.map((stat: any) => (
                      <GameStatItem
                        key={stat.game}
                        game={stat.game}
                        tournaments={stat.tournaments}
                        wins={stat.wins}
                        winRate={stat.win_rate}
                        earnings={stat.earnings}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No game statistics available yet.</p>
                    <p className="text-sm mt-2">Join and play tournaments to see your stats here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="achievements">
            <div className="grid grid-cols-2 gap-4">
              <AchievementCard
                title="First Win"
                description="Win your first tournament"
                icon={Trophy}
                unlocked={profile.tournaments_won > 0}
              />
              <AchievementCard
                title="High Roller"
                description="Enter a tournament with $50+ entry fee"
                icon={Award}
                unlocked={profile.high_roller}
              />
              <AchievementCard
                title="Hat Trick"
                description="Win 3 tournaments in a row"
                icon={Trophy}
                unlocked={profile.hat_trick}
              />
              <AchievementCard
                title="Big Winner"
                description="Win over $500 in prizes"
                icon={Award}
                unlocked={profile.total_earnings >= 500}
              />
            </div>
          </TabsContent>
          <TabsContent value="edit">
            <EditProfileTab profile={profile} />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
      <MobileNavigation />
    </main>
  )
}

function EditProfileTab({ profile }: { profile: any }) {
  const [formData, setFormData] = useState({
    username: profile.username || "",
    fullName: profile.full_name || "",
    bio: profile.bio || "",
    steamId: profile.steam_id || "",
    epicGamesId: profile.epic_games_id || "",
    riotId: profile.riot_id || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(profile.avatar_url || null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (image: File) => {
    const supabase = createClient()
    try {
      const fileExt = image.name.split(".").pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { data, error: uploadError } = await supabase.storage.from("avatars").upload(filePath, image)

      if (uploadError) {
        console.error("Image upload error", uploadError)
        throw uploadError
      }

      const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(filePath)
      return publicUrl.publicUrl
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Image Upload Failed",
        description: "There was an error uploading your image.",
        variant: "destructive",
      })
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let avatar_url = profile.avatar_url

      if (selectedImage) {
        const uploadedUrl = await uploadImage(selectedImage)
        if (uploadedUrl) {
          avatar_url = uploadedUrl
        } else {
          setIsSubmitting(false)
          return
        }
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, avatar_url }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                  {previewImage ? (
                    <AvatarImage src={previewImage || "/placeholder.svg"} alt="Profile Preview" />
                  ) : (
                    <AvatarFallback>
                      {formData.username ? formData.username.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Edit className="h-4 w-4" />
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full p-2 border rounded-md h-20"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gaming Profiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Steam ID</label>
            <input
              type="text"
              name="steamId"
              value={formData.steamId}
              onChange={handleChange}
              placeholder="Enter your Steam ID"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Epic Games ID</label>
            <input
              type="text"
              name="epicGamesId"
              value={formData.epicGamesId}
              onChange={handleChange}
              placeholder="Enter your Epic Games ID"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Riot ID</label>
            <input
              type="text"
              name="riotId"
              value={formData.riotId}
              onChange={handleChange}
              placeholder="Enter your Riot ID"
              className="w-full p-2 border rounded-md"
            />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Gaming Profiles"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Tournament Reminders</p>
              <p className="text-sm text-gray-500">Get notified before tournaments start</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Tournament Alerts</p>
              <p className="text-sm text-gray-500">Notify when new tournaments are posted</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Prize Notifications</p>
              <p className="text-sm text-gray-500">Get notified when you win prizes</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Profile Stats</p>
              <p className="text-sm text-gray-500">Allow others to see your tournament stats</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Online Status</p>
              <p className="text-sm text-gray-500">Let others see when you're online</p>
            </div>
            <input type="checkbox" className="toggle" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Two-Factor Authentication
          </Button>
          <Button variant="destructive" className="w-full">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

interface GameStatItemProps {
  game: string
  tournaments: number
  wins: number
  winRate: number
  earnings: number
}

function GameStatItem({ game, tournaments, wins, winRate, earnings }: GameStatItemProps) {
  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{game}</h3>
        <span className="text-sm text-green-600">${earnings} earned</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Tournaments</p>
          <p className="font-medium">{tournaments}</p>
        </div>
        <div>
          <p className="text-gray-500">Wins</p>
          <p className="font-medium">{wins}</p>
        </div>
        <div>
          <p className="text-gray-500">Win Rate</p>
          <p className="font-medium">{winRate}%</p>
        </div>
      </div>
    </div>
  )
}

interface AchievementCardProps {
  title: string
  description: string
  icon: React.ElementType
  unlocked?: boolean
}

function AchievementCard({ title, description, icon: Icon, unlocked }: AchievementCardProps) {
  return (
    <Card className={`border ${unlocked ? "bg-white" : "bg-gray-100 opacity-60"}`}>
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div
          className={`p-3 rounded-full ${unlocked ? "bg-primary/10 text-primary" : "bg-gray-200 text-gray-400"} mb-3`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>
  )
}

"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Edit, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          throw new Error("User not authenticated")
        }

        // Fetch complete profile data from database
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Profile error:", profileError)
          // If profile doesn't exist, create a basic one
          if (profileError.code === "PGRST116") {
            const { data: newProfile, error: createError } = await supabase
              .from("profiles")
              .insert({
                id: user.id,
                username: user.email?.split("@")[0] || "user",
                full_name: user.user_metadata?.full_name || "",
                bio: user.user_metadata?.bio || "",
                avatar_url: user.user_metadata?.avatar_url || "",
                steam_id: user.user_metadata?.steam_id || "",
                epic_games_id: user.user_metadata?.epic_games_id || "",
                riot_id: user.user_metadata?.riot_id || "",
                tournaments_played: 0,
                tournaments_won: 0,
                total_earnings: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single()

            if (createError) {
              throw new Error(`Failed to create profile: ${createError.message}`)
            }
            setProfile(newProfile)
            return
          }
          throw new Error(`Failed to fetch profile data: ${profileError.message}`)
        }

        setProfile(profileData)
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
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto mt-10">
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-white shadow-md">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt="Profile" />
            <AvatarFallback>
              {profile?.username
                ? profile.username.charAt(0).toUpperCase()
                : profile?.full_name
                  ? profile.full_name.charAt(0).toUpperCase()
                  : "U"}
            </AvatarFallback>
          </Avatar>
          <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="mt-4 text-xl font-bold">{profile?.full_name || profile?.username || "User"}</h2>
        <p className="text-gray-500">@{profile?.username || "username"}</p>
        {profile?.bio && <p className="text-sm text-gray-600 text-center mt-2 max-w-xs">{profile.bio}</p>}
        <div className="flex gap-4 mt-4">
          <div className="text-center">
            <p className="font-bold">{profile?.tournaments_played || 0}</p>
            <p className="text-xs text-gray-500">Tournaments</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{profile?.tournaments_won || 0}</p>
            <p className="text-xs text-gray-500">Wins</p>
          </div>
          <div className="text-center">
            <p className="font-bold">${profile?.total_earnings || 0}</p>
            <p className="text-xs text-gray-500">Earnings</p>
          </div>
        </div>

        {/* Gaming IDs Section */}
        {(profile?.steam_id || profile?.epic_games_id || profile?.riot_id) && (
          <div className="w-full mt-4 p-3 bg-white rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Gaming Profiles</h3>
            <div className="space-y-1">
              {profile?.steam_id && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Steam:</span>
                  <span className="font-medium">{profile.steam_id}</span>
                </div>
              )}
              {profile?.epic_games_id && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Epic Games:</span>
                  <span className="font-medium">{profile.epic_games_id}</span>
                </div>
              )}
              {profile?.riot_id && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Riot:</span>
                  <span className="font-medium">{profile.riot_id}</span>
                </div>
              )}
            </div>
          </div>
        )}

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
    </div>
  )
}

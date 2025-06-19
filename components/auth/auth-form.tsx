"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Upload, User } from "lucide-react"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  // Additional signup fields
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
    bio: "",
    steamId: "",
    epicGamesId: "",
    riotId: "",
    profileImage: null as File | null,
  })

  const { toast } = useToast()
  const supabase = createClient()

  // Get the app URL from environment variables or use the current origin as fallback
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin

  const handleSignupDataChange = (field: string, value: string) => {
    setSignupData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSignupData((prev) => ({ ...prev, profileImage: file }))
    }
  }

  const uploadProfileImage = async (userId: string, file: File) => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

    if (uploadError) {
      console.error("Error uploading image:", uploadError)
      return null
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Upload profile image first if provided
      let avatarUrl = ""
      if (signupData.profileImage) {
        // Create a temporary ID for the image upload
        const tempId = Math.random().toString(36).substring(7)
        const fileExt = signupData.profileImage.name.split(".").pop()
        const fileName = `temp-${tempId}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, signupData.profileImage)

        if (!uploadError) {
          const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
          avatarUrl = data.publicUrl
        }
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            username: signupData.username,
            full_name: signupData.fullName,
            bio: signupData.bio,
            steam_id: signupData.steamId,
            epic_games_id: signupData.epicGamesId,
            riot_id: signupData.riotId,
            avatar_url: avatarUrl,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // Create profile directly after signup
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          username: signupData.username,
          full_name: signupData.fullName,
          bio: signupData.bio,
          steam_id: signupData.steamId,
          epic_games_id: signupData.epicGamesId,
          riot_id: signupData.riotId,
          avatar_url: avatarUrl,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        // Create wallet for the user
        await supabase.from("wallets").insert({
          user_id: authData.user.id,
          balance: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }

        toast({
          title: "Account created successfully!",
          description: "Welcome to GameTourneys! You can now join tournaments.",
        })

        // Redirect to home page immediately
        window.location.href = "/"
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "You have been signed in.",
      })
      window.location.href = "/"
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid login credentials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to GameTourneys</CardTitle>
        <CardDescription>Sign in or create an account to join tournaments</CardDescription>
      </CardHeader>
      <Tabs defaultValue="signin">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
        <TabsContent value="signup">
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4 pt-4 max-h-96 overflow-y-auto">
              {/* Profile Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {signupData.profileImage ? (
                      <img
                        src={URL.createObjectURL(signupData.profileImage) || "/placeholder.svg"}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">Upload</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-2">
                <label htmlFor="signup-email" className="text-sm font-medium">
                  Email *
                </label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={signupData.email}
                  onChange={(e) => handleSignupDataChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="signup-password" className="text-sm font-medium">
                  Password *
                </label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => handleSignupDataChange("password", e.target.value)}
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username *
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="gamer123"
                  value={signupData.username}
                  onChange={(e) => handleSignupDataChange("username", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={signupData.fullName}
                  onChange={(e) => handleSignupDataChange("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={signupData.bio}
                  onChange={(e) => handleSignupDataChange("bio", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm h-20 resize-none"
                />
              </div>

              {/* Gaming IDs */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Gaming Profiles (Optional)</h4>
                <div className="space-y-2">
                  <label htmlFor="steamId" className="text-sm font-medium">
                    Steam ID
                  </label>
                  <Input
                    id="steamId"
                    type="text"
                    placeholder="Your Steam ID"
                    value={signupData.steamId}
                    onChange={(e) => handleSignupDataChange("steamId", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="epicGamesId" className="text-sm font-medium">
                    Epic Games ID
                  </label>
                  <Input
                    id="epicGamesId"
                    type="text"
                    placeholder="Your Epic Games ID"
                    value={signupData.epicGamesId}
                    onChange={(e) => handleSignupDataChange("epicGamesId", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="riotId" className="text-sm font-medium">
                    Riot ID
                  </label>
                  <Input
                    id="riotId"
                    type="text"
                    placeholder="Your Riot ID"
                    value={signupData.riotId}
                    onChange={(e) => handleSignupDataChange("riotId", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

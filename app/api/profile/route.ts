import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Get the profile
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    // If profile doesn't exist, create one
    if (error.code === "PGRST116") {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: user.email?.split("@")[0],
          full_name: "",
          avatar_url: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      return NextResponse.json({
        ...newProfile,
        game_stats: [],
        high_roller: false,
        hat_trick: false,
      })
    }

    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  // Get game statistics
  const { data: gameStats, error: statsError } = await supabase.rpc("get_user_game_stats", {
    user_id: user.id,
  })

  // Get achievements
  const { data: achievements, error: achievementsError } = await supabase.rpc("get_user_achievements", {
    user_id: user.id,
  })

  // Return profile with additional data
  return NextResponse.json({
    ...profile,
    game_stats: gameStats || [],
    high_roller: achievements?.high_roller || false,
    hat_trick: achievements?.hat_trick || false,
  })
}

export async function PUT(request: Request) {
  const profileData = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  // Update the profile
  const { data, error } = await supabase
    .from("profiles")
    .update({
      username: profileData.username,
      full_name: profileData.fullName,
      bio: profileData.bio,
      steam_id: profileData.steamId,
      epic_games_id: profileData.epicGamesId,
      riot_id: profileData.riotId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

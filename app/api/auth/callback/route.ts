import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Get the app URL from environment variables
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || requestUrl.origin

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${appUrl}/`)
}

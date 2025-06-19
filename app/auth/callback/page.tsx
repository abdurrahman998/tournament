"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession()

      // Redirect to home page regardless of error
      router.push("/")
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p className="text-gray-500">Please wait while we complete your authentication.</p>
        <div className="mt-6 h-2 w-40 mx-auto bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-pulse rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

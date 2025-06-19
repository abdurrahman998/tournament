"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

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
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p className="text-gray-500">Please wait while we complete your authentication.</p>
      </div>
    </div>
  )
}

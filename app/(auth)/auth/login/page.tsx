import { AuthForm } from "@/components/auth/auth-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">GameTourneys</h1>
          <p className="text-gray-500 mt-2">Your ultimate gaming tournament platform</p>
        </div>
        <AuthForm />
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Trophy, Search, Wallet, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface EmptyStateProps {
  type: "tournaments" | "my-tournaments" | "wallet" | "search" | "error"
  message?: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ type, message, action }: EmptyStateProps) {
  const router = useRouter()

  const getIcon = () => {
    switch (type) {
      case "tournaments":
      case "my-tournaments":
        return <Trophy className="h-12 w-12 text-gray-400" />
      case "wallet":
        return <Wallet className="h-12 w-12 text-gray-400" />
      case "search":
        return <Search className="h-12 w-12 text-gray-400" />
      case "error":
        return <AlertCircle className="h-12 w-12 text-gray-400" />
      default:
        return <Trophy className="h-12 w-12 text-gray-400" />
    }
  }

  const getDefaultMessage = () => {
    switch (type) {
      case "tournaments":
        return "No tournaments available at the moment."
      case "my-tournaments":
        return "You haven't joined any tournaments yet."
      case "wallet":
        return "No transactions found in your wallet."
      case "search":
        return "No results found for your search."
      case "error":
        return "Something went wrong. Please try again."
      default:
        return "No data available."
    }
  }

  const getDefaultAction = () => {
    switch (type) {
      case "tournaments":
        return {
          label: "Check back later",
          href: "/",
        }
      case "my-tournaments":
        return {
          label: "Browse tournaments",
          href: "/",
        }
      case "wallet":
        return {
          label: "Add funds",
          href: "/wallet?tab=add",
        }
      case "search":
        return {
          label: "Clear search",
          href: "/",
        }
      case "error":
        return {
          label: "Go back",
          href: "/",
        }
      default:
        return {
          label: "Go home",
          href: "/",
        }
    }
  }

  const displayMessage = message || getDefaultMessage()
  const displayAction = action || getDefaultAction()

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-gray-100 p-4 rounded-full mb-4">{getIcon()}</div>
      <h3 className="text-lg font-medium mb-2">{displayMessage}</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        {type === "tournaments" && "New tournaments are added regularly. Check back soon!"}
        {type === "my-tournaments" && "Join tournaments to see them listed here."}
        {type === "wallet" && "Start by adding funds to your wallet."}
        {type === "search" && "Try different keywords or browse all tournaments."}
        {type === "error" && "Please try refreshing the page or contact support if the issue persists."}
      </p>
      <Button onClick={() => router.push(displayAction.href)}>{displayAction.label}</Button>
    </div>
  )
}

"use client"

import type React from "react"

import { Home, Trophy, Wallet, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { WalletBalanceIndicator } from "@/components/wallet-balance-indicator"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  indicator?: React.ReactNode
  requiresAuth?: boolean
}

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Tournaments",
    href: "/",
    icon: Trophy,
  },
  {
    name: "Wallet",
    href: "/wallet",
    icon: Wallet,
    indicator: <WalletBalanceIndicator />,
    requiresAuth: true,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    requiresAuth: true,
  },
]

export function MobileNavigation() {
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
    }

    checkAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200">
      <nav className="flex justify-around">
        {navItems.map((item) => {
          // Skip auth-required items if not authenticated
          if (item.requiresAuth && !isAuthenticated) {
            return null
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-3 text-xs relative",
                pathname === item.href ? "text-primary" : "text-gray-500 hover:text-gray-900",
              )}
            >
              <div className="relative">
                <item.icon className="h-6 w-6 mb-1" />
                {item.indicator && isAuthenticated && item.indicator}
              </div>
              <span>{item.name}</span>
            </Link>
          )
        })}
        {!isAuthenticated && (
          <Link
            href="/auth/login"
            className="flex flex-col items-center py-2 px-3 text-xs relative text-gray-500 hover:text-gray-900"
          >
            <div className="relative">
              <User className="h-6 w-6 mb-1" />
            </div>
            <span>Sign In</span>
          </Link>
        )}
      </nav>
    </div>
  )
}

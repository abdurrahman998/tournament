import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { LoadingProvider } from "@/components/providers/loading-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GameTourneys - Gaming Tournament Platform",
  description: "Join and host gaming tournaments with ease",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LoadingProvider>
          {children}
          <Toaster />
        </LoadingProvider>
      </body>
    </html>
  )
}

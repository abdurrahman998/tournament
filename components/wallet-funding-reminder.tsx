"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, X, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface WalletFundingReminderProps {
  minEntryFee: number
  tournamentCount: number
  onDismiss: () => void
}

export function WalletFundingReminder({ minEntryFee, tournamentCount, onDismiss }: WalletFundingReminderProps) {
  const router = useRouter()

  return (
    <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Low Wallet Balance</h3>
              <p className="text-sm text-blue-700 mt-1">
                You need at least ${minEntryFee} to join{" "}
                {tournamentCount === 1 ? "this tournament" : "some tournaments"}. Add funds to your wallet to
                participate!
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onDismiss}>
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
        <div className="mt-3 flex justify-end">
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push("/wallet")}
          >
            Add Funds
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

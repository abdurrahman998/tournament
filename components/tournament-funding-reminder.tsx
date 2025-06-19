"use client"

import { Button } from "@/components/ui/button"
import { Wallet, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface TournamentFundingReminderProps {
  entryFee: number
  currentBalance: number
  tournamentName: string
}

export function TournamentFundingReminder({
  entryFee,
  currentBalance,
  tournamentName,
}: TournamentFundingReminderProps) {
  const router = useRouter()
  const amountNeeded = entryFee - currentBalance

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-full">
          <Wallet className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-blue-900">Add Funds to Join This Tournament</h3>
          <p className="text-sm text-blue-700 mt-1">
            You need <span className="font-semibold">${amountNeeded.toFixed(2)}</span> more to join "{tournamentName}".
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600"
                  style={{ width: `${Math.min((currentBalance / entryFee) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>Current: ${currentBalance.toFixed(2)}</span>
                <span>Required: ${entryFee.toFixed(2)}</span>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              onClick={() => router.push("/wallet")}
            >
              Add Funds
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

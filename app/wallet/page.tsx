"use client"

import { MobileHeader } from "@/components/mobile-header"
import { MobileNavigation } from "@/components/mobile-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { WalletTournamentsReminder } from "@/components/wallet-tournaments-reminder"

export default function WalletPage() {
  const [walletData, setWalletData] = useState<{ balance: number; transactions: any[] }>({
    balance: 245.0,
    transactions: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const response = await fetch("/api/wallet")
        if (response.ok) {
          const data = await response.json()
          setWalletData({
            balance: data.balance || 0,
            transactions: data.transactions || [],
          })
        } else {
          console.error("Failed to fetch wallet data")
        }
      } catch (error) {
        console.error("Error fetching wallet data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <MobileHeader />
      <div className="flex-1 p-4 pb-20">
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardDescription>Available Balance</CardDescription>
            <CardTitle className="text-3xl">${loading ? "..." : walletData.balance.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
              <Button variant="outline" className="flex-1">
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <WalletTournamentsReminder walletBalance={walletData.balance} />

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="transactions">History</TabsTrigger>
            <TabsTrigger value="add">Add Money</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : walletData.transactions.length > 0 ? (
                walletData.transactions.map((transaction, index) => (
                  <TransactionItem
                    key={transaction.id || index}
                    type={transaction.type}
                    amount={transaction.amount}
                    description={transaction.description}
                    game={transaction.game}
                    date={transaction.date}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No transactions found</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="add">
            <AddMoneyTab />
          </TabsContent>
          <TabsContent value="withdraw">
            <WithdrawTab walletData={walletData} />
          </TabsContent>
          <TabsContent value="earnings">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading earnings...</div>
              ) : walletData.transactions.filter((t) => t.type === "credit" && t.description.includes("Prize")).length >
                0 ? (
                walletData.transactions
                  .filter((t) => t.type === "credit" && t.description.includes("Prize"))
                  .map((transaction, index) => (
                    <TransactionItem
                      key={transaction.id || index}
                      type={transaction.type}
                      amount={transaction.amount}
                      description={transaction.description}
                      game={transaction.game}
                      date={transaction.date}
                    />
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">No earnings found</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <MobileNavigation />
    </main>
  )
}

function AddMoneyTab() {
  const [senderNumber, setSenderNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lastRequestTime, setLastRequestTime] = useState<Date | null>(null)
  const [requestStatus, setRequestStatus] = useState<"success" | "failed" | null>(null)

  const canMakeRequest = !lastRequestTime || Date.now() - lastRequestTime.getTime() > 5 * 60 * 1000

  const handleAddMoney = async () => {
    if (!canMakeRequest) return

    setIsLoading(true)
    setLastRequestTime(new Date())

    // Simulate API call
    setTimeout(() => {
      const success = Math.random() > 0.3 // 70% success rate
      setRequestStatus(success ? "success" : "failed")
      setIsLoading(false)

      if (success) {
        setSenderNumber("")
        setTransactionId("")
        setAmount("")
      }
    }, 2000)
  }

  const timeUntilNextRequest = lastRequestTime
    ? Math.max(0, 5 * 60 * 1000 - (Date.now() - lastRequestTime.getTime()))
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Money to Wallet</CardTitle>
        <CardDescription>Send money via mobile banking and provide transaction details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Payment Instructions:</h4>
          <p className="text-sm text-gray-600 mb-2">
            Send money to: <strong>+1234567890</strong>
          </p>
          <p className="text-sm text-gray-600">Then fill the form below with your transaction details</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full p-3 border rounded-lg"
              min="10"
              max="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Your Phone Number</label>
            <input
              type="tel"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID from your mobile banking"
              className="w-full p-3 border rounded-lg"
            />
          </div>

          {requestStatus && (
            <div
              className={`p-4 rounded-lg ${requestStatus === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              {requestStatus === "success"
                ? "✅ Request submitted successfully! Your wallet will be updated within 24 hours."
                : "❌ Request failed. Please check your details and try again."}
            </div>
          )}

          {!canMakeRequest && (
            <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
              ⏰ Please wait {Math.ceil(timeUntilNextRequest / 60000)} minutes before making another request.
            </div>
          )}

          <Button
            onClick={handleAddMoney}
            disabled={!senderNumber || !transactionId || !amount || isLoading || !canMakeRequest}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Submit Request"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface WithdrawTabProps {
  walletData: { balance: number; transactions: any[] }
}

function WithdrawTab({ walletData }: WithdrawTabProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleWithdraw = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setWithdrawAmount("")
      setPhoneNumber("")
      alert("Withdrawal request submitted! Funds will be sent within 24 hours.")
    }, 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdraw Money</CardTitle>
        <CardDescription>Withdraw funds to your mobile banking account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Withdrawal Info:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Minimum withdrawal: $10</li>
            <li>• Processing time: 24-48 hours</li>
            <li>• Withdrawal fee: $2 per transaction</li>
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Withdrawal Amount ($)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              className="w-full p-3 border rounded-lg"
              min="10"
              max={walletData.balance.toString()}
            />
            <p className="text-sm text-gray-500 mt-1">Available balance: ${walletData.balance.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your mobile banking number"
              className="w-full p-3 border rounded-lg"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Withdrawal Amount:</span>
              <span>${withdrawAmount || "0"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Processing Fee:</span>
              <span>$2.00</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-medium">
              <span>You'll Receive:</span>
              <span>${withdrawAmount ? (Number.parseFloat(withdrawAmount) - 2).toFixed(2) : "0.00"}</span>
            </div>
          </div>

          <Button
            onClick={handleWithdraw}
            disabled={!withdrawAmount || !phoneNumber || isLoading || Number.parseFloat(withdrawAmount) < 10}
            className="w-full"
          >
            {isLoading ? "Processing..." : "Submit Withdrawal"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface TransactionItemProps {
  type: "credit" | "debit"
  amount: number
  description: string
  game?: string
  date: string
}

function TransactionItem({ type, amount, description, game, date }: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
          {type === "credit" ? (
            <ArrowDownLeft className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowUpRight className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div>
          <p className="font-medium">{description}</p>
          {game && <p className="text-sm text-gray-500">{game}</p>}
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>
      <div className={`font-bold ${type === "credit" ? "text-green-600" : "text-red-600"}`}>
        {type === "credit" ? "+" : "-"}${amount}
      </div>
    </div>
  )
}

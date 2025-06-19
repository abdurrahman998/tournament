export interface Tournament {
  id: string
  title: string
  gameName: string
  gameCoverImage: string
  description: string
  rules: string[]
  startTime: Date | string
  joinedPlayers: number
  totalSlots: number
  entryFee: number
  prizePool: number
  joined: boolean
  roomId?: string
  roomPassword?: string
  status?: string
}

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
  steam_id: string | null
  epic_games_id: string | null
  riot_id: string | null
  tournaments_played: number
  tournaments_won: number
  total_earnings: number
  game_stats?: GameStat[]
  high_roller?: boolean
  hat_trick?: boolean
}

export interface GameStat {
  game: string
  tournaments: number
  wins: number
  winRate: number
  earnings: number
}

export interface Transaction {
  id: string
  amount: number
  type: "deposit" | "withdrawal" | "tournament_entry" | "tournament_prize" | "refund"
  status: "pending" | "completed" | "failed" | "cancelled"
  description: string
  date: string
  game?: string | null
  tournamentTitle?: string | null
}

export interface Wallet {
  balance: number
  transactions: Transaction[]
}

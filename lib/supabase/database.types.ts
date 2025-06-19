export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          title: string
          game_name: string
          game_cover_image: string | null
          description: string
          rules: Json
          start_time: string
          total_slots: number
          entry_fee: number
          prize_pool: number
          room_id: string | null
          room_password: string | null
          created_at: string
          created_by: string
          status: "upcoming" | "active" | "completed" | "cancelled"
        }
        Insert: {
          id?: string
          title: string
          game_name: string
          game_cover_image?: string | null
          description: string
          rules: Json
          start_time: string
          total_slots: number
          entry_fee: number
          prize_pool: number
          room_id?: string | null
          room_password?: string | null
          created_at?: string
          created_by: string
          status?: "upcoming" | "active" | "completed" | "cancelled"
        }
        Update: {
          id?: string
          title?: string
          game_name?: string
          game_cover_image?: string | null
          description?: string
          rules?: Json
          start_time?: string
          total_slots?: number
          entry_fee?: number
          prize_pool?: number
          room_id?: string | null
          room_password?: string | null
          created_at?: string
          created_by?: string
          status?: "upcoming" | "active" | "completed" | "cancelled"
        }
      }
      tournament_participants: {
        Row: {
          id: string
          tournament_id: string
          user_id: string
          joined_at: string
          status: "registered" | "checked_in" | "no_show" | "disqualified" | "completed"
          placement: number | null
          payment_status: "pending" | "completed" | "refunded"
          transaction_id: string | null
        }
        Insert: {
          id?: string
          tournament_id: string
          user_id: string
          joined_at?: string
          status?: "registered" | "checked_in" | "no_show" | "disqualified" | "completed"
          placement?: number | null
          payment_status?: "pending" | "completed" | "refunded"
          transaction_id?: string | null
        }
        Update: {
          id?: string
          tournament_id?: string
          user_id?: string
          joined_at?: string
          status?: "registered" | "checked_in" | "no_show" | "disqualified" | "completed"
          placement?: number | null
          payment_status?: "pending" | "completed" | "refunded"
          transaction_id?: string | null
        }
      }
      profiles: {
        Row: {
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
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          steam_id?: string | null
          epic_games_id?: string | null
          riot_id?: string | null
          tournaments_played?: number
          tournaments_won?: number
          total_earnings?: number
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          steam_id?: string | null
          epic_games_id?: string | null
          riot_id?: string | null
          tournaments_played?: number
          tournaments_won?: number
          total_earnings?: number
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: "deposit" | "withdrawal" | "tournament_entry" | "tournament_prize" | "refund"
          status: "pending" | "completed" | "failed" | "cancelled"
          description: string
          reference_id: string | null
          created_at: string
          updated_at: string
          tournament_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: "deposit" | "withdrawal" | "tournament_entry" | "tournament_prize" | "refund"
          status?: "pending" | "completed" | "failed" | "cancelled"
          description: string
          reference_id?: string | null
          created_at?: string
          updated_at?: string
          tournament_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: "deposit" | "withdrawal" | "tournament_entry" | "tournament_prize" | "refund"
          status?: "pending" | "completed" | "failed" | "cancelled"
          description?: string
          reference_id?: string | null
          created_at?: string
          updated_at?: string
          tournament_id?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: "tournament" | "payment" | "system" | "reminder"
          read: boolean
          created_at: string
          tournament_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: "tournament" | "payment" | "system" | "reminder"
          read?: boolean
          created_at?: string
          tournament_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: "tournament" | "payment" | "system" | "reminder"
          read?: boolean
          created_at?: string
          tournament_id?: string | null
        }
      }
      games: {
        Row: {
          id: string
          name: string
          cover_image: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          cover_image?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          cover_image?: string | null
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

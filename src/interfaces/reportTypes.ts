export interface ReportTotals {
  total_finished: number
  total_deleted: number
  total_ongoing: number
  total_active_not_ongoing: number
  total_ongoing_promoted: number
  total_active_promoted_not_ongoing: number
}

export interface ReportDm {
  dm_discord_id: string
  dm_name: string
  active_tables: number
  ongoing_tables: number
  unique_players: number
  unique_players_ongoing: number
  total_players: number
  total_players_ongoing: number
  avg_ticket: number
  weighted_avg_ticket: number
  monthly_value_estimate: number
}

export interface Report {
  totals: ReportTotals
  per_dm: ReportDm[]
}
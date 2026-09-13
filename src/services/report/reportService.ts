import { ReportRepository } from '../../repositories/reportRepository'
import { DBTransaction } from '../../types/transactionType'
import { sql, count, eq } from 'drizzle-orm'
import { game, discordUser, currentPlayer } from '../../models'

import { Report } from '../../interfaces/reportTypes'
import { ReportPdf } from './reportPdf'

export class ReportService {
  constructor(
    private repo = new ReportRepository(),
    private reportPdf = new ReportPdf(),
  ) { }

  async computeReport(transaction: DBTransaction): Promise<Report> {
    const finished = await transaction
      .select({ count: count() })
      .from(game)
      .where(eq(game.finished, true))

    const deleted = await transaction
      .select({ count: count() })
      .from(game)
      .where(
        sql`${game.is_active} = 0
          AND ${game.closed_date} IS NOT NULL
          AND ${game.finished} = 0`,
      )

    const ongoing = await transaction
      .select({ count: count() })
      .from(game)
      .where(
        sql`${game.is_ongoing} = 1
          AND ${game.is_active} = 1`,
      )

    const activeNotOngoing = await transaction
      .select({ count: count() })
      .from(game)
      .where(
        sql`${game.is_ongoing} = 0
          AND ${game.is_active} = 1`,
      )

    const ongoingPromoted = await transaction
      .select({ count: count() })
      .from(game)
      .where(
        sql`${game.is_ongoing} = 1
          AND ${game.is_active} = 1
          AND ${game.is_being_promoted} = 1`,
      )

    const activeNotOngoingPromoted = await transaction
      .select({ count: count() })
      .from(game)
      .where(
        sql`${game.is_ongoing} = 0
          AND ${game.is_active} = 1
          AND ${game.is_being_promoted} = 1`,
      )

    const totals = {
      total_finished: finished?.[0]?.count ?? 0,
      total_deleted: deleted?.[0]?.count ?? 0,
      total_ongoing: ongoing?.[0]?.count ?? 0,
      total_active_not_ongoing:
        activeNotOngoing?.[0]?.count ?? 0,
      total_ongoing_promoted:
        ongoingPromoted?.[0]?.count ?? 0,
      total_active_promoted_not_ongoing:
        activeNotOngoingPromoted?.[0]?.count ?? 0,
    }

    console.log('Computed totals:', totals) // Log para depuração

    const gamePlayerAgg = await transaction
      .select({
        game_id: currentPlayer.game_id,
        player_count: sql<number>`COUNT(*)`.as('player_count'),
      })
      .from(currentPlayer)
      .where(eq(currentPlayer.is_staff_player, false))
      .groupBy(currentPlayer.game_id)
      .as('game_player_agg')

    console.log('Game Player Aggregation:', gamePlayerAgg) // Log para depuração

    const freqMultiplier = transaction
      .select({
        id: game.id,
        multiplier: sql<number>`
      CASE ${game.frequency}
        WHEN 'Semanal' THEN 1
        WHEN 'Quinzenal' THEN 0.5
        ELSE 0
      END
    `.as('multiplier'),
        monthly_multiplier: sql<number>`
      CASE ${game.frequency}
        WHEN 'Semanal' THEN 4.5
        WHEN 'Quinzenal' THEN 2.25
        ELSE 0
      END
    `.as('monthly_multiplier'),
      })
      .from(game)
      .as('freq_multiplier')

    const dmRows = await transaction
      .select({
        dm_discord_id: game.dm_discord_id,
        dm_name: sql<string>`COALESCE(CONCAT(${discordUser.username}, '(',COALESCE(${discordUser.server_nick}, ${discordUser.global_name}), ')'), 'Desconhecido')`,
        active_tables: sql<number>`COUNT(DISTINCT ${game.id})`,
        ongoing_tables: sql<number>`COUNT(DISTINCT CASE WHEN ${game.is_ongoing} = 1 THEN ${game.id} END)`,
        total_players: sql<number>`COALESCE(SUM(${gamePlayerAgg.player_count}), 0)`,
        total_players_ongoing: sql<number>`COALESCE(SUM(CASE WHEN ${game.is_ongoing} = 1 THEN ${gamePlayerAgg.player_count} END), 0)`,
        avg_ticket: sql<number>`AVG(CASE WHEN ${game.is_ongoing} = 1 THEN ${game.price}  END)`,
        weighted_num: sql<number>`
          SUM(CASE WHEN ${game.is_ongoing} = 1 THEN CAST(${game.price} AS DECIMAL(12,4)) * COALESCE(${gamePlayerAgg.player_count}, 0) * ${freqMultiplier.multiplier} END)
          / NULLIF(SUM(CASE WHEN ${game.is_ongoing} = 1 THEN COALESCE(${gamePlayerAgg.player_count}, 0) END), 0)
        `,
        monthly_value_estimate: sql<number>`
          COALESCE(SUM(CASE WHEN ${game.is_ongoing} = 1 THEN CAST(${game.price} AS DECIMAL(12,4)) * COALESCE(${gamePlayerAgg.player_count}, 0) * ${freqMultiplier.monthly_multiplier} END), 0)
        `,
      })
      .from(game)
      .leftJoin(discordUser, eq(discordUser.id, game.dm_discord_id))
      .leftJoin(gamePlayerAgg, eq(gamePlayerAgg.game_id, game.id))
      .leftJoin(freqMultiplier, eq(freqMultiplier.id, game.id))
      .where(eq(game.is_active, true))
      .groupBy(game.dm_discord_id)
      .orderBy(sql`COUNT(DISTINCT ${game.id}) DESC`)

    console.log('Per DM Rows:', dmRows) // Log para depuração

    // unique_players precisa de dedup no nível do DM, não dá pra somar por jogo
    const uniqueRows = await transaction
      .select({
        dm_discord_id: game.dm_discord_id,
        unique_players: sql<number>`COUNT(DISTINCT ${currentPlayer.discord_player_id})`,
        unique_players_ongoing: sql<number>`COUNT(DISTINCT CASE WHEN ${game.is_ongoing} = 1 THEN ${currentPlayer.discord_player_id} END)`,
      })
      .from(game)
      .innerJoin(currentPlayer, sql`${currentPlayer.game_id} = ${game.id} AND ${currentPlayer.is_staff_player} = 0`)
      .where(eq(game.is_active, true))
      .groupBy(game.dm_discord_id)

    const uniqueByDm = new Map(uniqueRows.map(r => [r.dm_discord_id, r]))

    const perDm = dmRows.map((r: any) => {
      const u = uniqueByDm.get(r.dm_discord_id)
      return {
        dm_discord_id: r.dm_discord_id,
        dm_name: r.dm_name,
        active_tables: Number(r.active_tables ?? 0),
        ongoing_tables: Number(r.ongoing_tables ?? 0),
        unique_players: Number(u?.unique_players ?? 0),
        unique_players_ongoing: Number(u?.unique_players_ongoing ?? 0),
        total_players: Number(r.total_players ?? 0),
        total_players_ongoing: Number(r.total_players_ongoing ?? 0),
        avg_ticket: Number(r.avg_ticket ?? 0),
        weighted_avg_ticket: Number(r.weighted_num ?? 0),
        monthly_value_estimate: Number(r.monthly_value_estimate ?? 0),
      }
    })
    console.log('Per DM:', perDm) // Log para depuração

    return {
      totals,
      per_dm: perDm,
    }
  }

  async getCachedReport(transaction: DBTransaction) {
    const cached = await this.repo.findLatest(transaction)

    if (!cached) {
      return null
    }

    return {
      id: cached.id,
      report_json: cached.report_json,
      created_at: cached.created_at,
    }
  }

  async saveReport(
    transaction: DBTransaction,
    reportJson: unknown,
  ) {
    console.log('Saving report JSON:', reportJson) // Log para depuração
    return await this.repo.create(
      transaction,
      reportJson,
    )
  }

  async generatePdfBuffer(
    reportJson: unknown,
    createdAt: Date
  ): Promise<Buffer> {
    const data =
      typeof reportJson === 'string'
        ? JSON.parse(reportJson)
        : reportJson

    return this.reportPdf.generate(data as Report, createdAt)
  }
}
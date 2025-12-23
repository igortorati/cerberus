import { eq, sql } from 'drizzle-orm'
import { game, Game, NewGame } from '../models/gameModel'
import { DBTransaction } from '../types/transactionType'
import { MAX_DISCORD_CHOICES } from '../constants/discordConstants'
import { discordUser } from '../models'

export class GameRepository {
  async create(transaction: DBTransaction, newGame: NewGame): Promise<number> {
    const [inserted] = await transaction.insert(game).values(newGame).$returningId()
    return inserted.id
  }

  async findAll(transaction: DBTransaction): Promise<Game[]> {
    const allGames = await transaction.select().from(game)
    return allGames
  }

  async findById(transaction: DBTransaction, id: number): Promise<Game | undefined> {
    const [row] = await transaction
      .select()
      .from(game)
      .where(eq(game.id, Number(id)))
    return row
  }

  async findTableBySearch(
    transaction: DBTransaction,
    search?: string
  ): Promise<{ name: string; value: string }[]> {
    const searchTerm = search?.trim().toLowerCase() || ''

    const fullTableNameString = sql<string>`
      CONCAT(
        CASE
          WHEN ${game.is_active} = false THEN '❌'
          WHEN ${game.current_players} >= ${game.max_players} THEN '🟡'
          WHEN ${game.current_players} < ${game.max_players} AND ${game.current_staff_players} < ${game.max_staff_players} THEN '🟢⭐'
          ELSE '🟢'
        END,
        ' ',
        ${game.name},
        ' (',
        COALESCE(${discordUser.server_nick}, ${discordUser.global_name}, 'Desconhecido'),
        ' - ',
        COALESCE(${game.day_of_week}, 'Dia indefinido'),
        ' ',
        COALESCE(DATE_FORMAT(${game.time}, '%H:%i'), 'Hora indefinida'),
        ')'
      )
    `

    let condition;

    if (searchTerm !== '') {
      condition = sql`LOWER(${fullTableNameString}) LIKE ${'%' + searchTerm + '%'}`
    }

    const results = await transaction
      .select({
        id: game.id,
        name: fullTableNameString.as('name'),
      })
      .from(game)
      .leftJoin(discordUser, eq(game.dm_discord_id, discordUser.id))
      .where(condition)
      .limit(MAX_DISCORD_CHOICES)

    return results.map(entry => ({
      value: entry.id.toString(),
      name: entry.name,
    }))
  }

  async update(transaction: DBTransaction, id: number, data: Partial<NewGame>): Promise<void> {
    await transaction
      .update(game)
      .set(data)
      .where(eq(game.id, Number(id)))
  }

  // Note: This is a soft delete, the data will remain in the database
  async delete(transaction: DBTransaction, id: number): Promise<void> {
    const setDeleteFields: Partial<NewGame> = {
      is_active: false,
      closed_date: new Date(),
    }
    await transaction
      .update(game)
      .set(setDeleteFields)
      .where(eq(game.id, Number(id)))
  }
}

import { and, eq } from 'drizzle-orm'
import { CurrentPlayer, currentPlayer, NewCurrentPlayer } from '../models/currentPlayerModel'
import { DBTransaction } from '../types/transactionType'

export class CurrentPlayerRepository {
  async findAllByGameId(transaction: DBTransaction, gameId: number) {
    return await transaction
      .select()
      .from(currentPlayer)
      .where(eq(currentPlayer.game_id, gameId))
  }

  async findByDiscordUser(transaction: DBTransaction, discordId: string) {
    return await transaction
      .select()
      .from(currentPlayer)
      .where(eq(currentPlayer.discord_player_id, discordId))
  }
  
  async findByDiscordUserAndTableId(transaction: DBTransaction, discordId: string, gameId: number): Promise<CurrentPlayer | undefined> {
    return await transaction.query.currentPlayer.findFirst({
      where:
        and(
          eq(currentPlayer.discord_player_id, discordId),
          eq(currentPlayer.game_id, gameId)
        )
    })
  }

  async add(transaction: DBTransaction, data: NewCurrentPlayer) {
    await transaction.insert(currentPlayer).values(data)
  }

  async remove(transaction: DBTransaction, id: number) {
    await transaction.delete(currentPlayer).where(eq(currentPlayer.id, id))
  }

  async removeByGameAndUser(transaction: DBTransaction, gameId: number, discordId: string) {
    await transaction
      .delete(currentPlayer)
      .where(and(eq(currentPlayer.game_id, gameId), eq(currentPlayer.discord_player_id, discordId)))
  }

  async updateStaffStatus(transaction: DBTransaction, id: number, isStaff: boolean) {
    await transaction
      .update(currentPlayer)
      .set({ is_staff: isStaff })
      .where(eq(currentPlayer.id, id))
  }
}

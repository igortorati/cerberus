import { and, eq } from 'drizzle-orm'
import { currentPlayer, NewCurrentPlayer } from '../models/currentPlayerModel'
import { DBTransaction } from '../types/transactionType'
import { discordUser } from '../models'
import { PlayerOnTable } from '../interfaces/playerOnTableInterface'

export class CurrentPlayerRepository {
  async findAllByGameId(transaction: DBTransaction, gameId: number): Promise<PlayerOnTable[]> {
    return await transaction
      .select({
        id: currentPlayer.id,
        gameId: currentPlayer.game_id,
        isStaffPlayer: currentPlayer.is_staff_player,

        discordUserId: discordUser.id,
        username: discordUser.username,
        globalName: discordUser.global_name,
        nickname: discordUser.server_nick,
      })
      .from(currentPlayer)
      .innerJoin(
        discordUser,
        eq(currentPlayer.discord_player_id, discordUser.id)
      )
      .where(eq(currentPlayer.game_id, gameId))
  }

  async findByDiscordUser(transaction: DBTransaction, discordId: string) {
    return await transaction
      .select()
      .from(currentPlayer)
      .where(eq(currentPlayer.discord_player_id, discordId))
  }
  
  async findByDiscordUserAndTableId(
  transaction: DBTransaction,
  discordId: string,
  gameId: number,
): Promise<PlayerOnTable | undefined> {
  return await transaction.query.currentPlayer.findFirst({
    where: (currentPlayer, { and, eq }) =>
      and(
        eq(currentPlayer.discord_player_id, discordId),
        eq(currentPlayer.game_id, gameId),
      ),
    with: {
      playerUser: {
        columns: {
          id: true,
          username: true,
          global_name: true,
          server_nick: true,
        },
      },
    },
  }).then((result) => {
    if (!result) return undefined

    return {
      id: result.id,
      gameId: result.game_id,
      isStaffPlayer: result.is_staff_player,

      discordUserId: result.playerUser.id,
      username: result.playerUser.username,
      globalName: result.playerUser.global_name,
      nickname: result.playerUser.server_nick,
    }
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
      .set({ is_staff_player: isStaff })
      .where(eq(currentPlayer.id, id))
  }
}

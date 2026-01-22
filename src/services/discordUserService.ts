import { DiscordUserRepository } from '../repositories/discordUserRepository'
import { DiscordUser, NewDiscordUser } from '../models/discordUserModel'
import { DBTransaction } from '../types/transactionType'
import { Env } from '../interfaces/envInterface'
import { fetchGuildUser } from '../utils/getDiscordUsers'
import { mapFechedDiscordUserToNewDiscordUser } from '../utils/mapFechedDiscordUserToNewDiscordUser'
import { PlayerOnTable } from '../interfaces/playerOnTableInterface'

export class DiscordUserService {
  private repo = new DiscordUserRepository()

  async createUser(transaction: DBTransaction, discordUser: NewDiscordUser): Promise<void> {
    await this.repo.create(transaction, discordUser)
  }

  async getUsersByIds(transaction: DBTransaction, ids: Set<string>): Promise<DiscordUser[]> {
    return await this.repo.findAllByIds(transaction, Array.from(ids))
  }

  async checkUserExists(transaction: DBTransaction, id: string): Promise<boolean> {
    return !!(await this.repo.findById(transaction, id))
  }

  async updateUser(transaction: DBTransaction, discordUser: NewDiscordUser): Promise<void> {
    await this.repo.update(transaction, discordUser.id, discordUser)
  }

  async createOrUpdateUser(transaction: DBTransaction, discordUserId: string, guildId: string | undefined, env: Env): Promise<PlayerOnTable> {
    const discordUserService = new DiscordUserService()
    const isDiscordUserOnDB = await discordUserService.checkUserExists(transaction,discordUserId)
    const discordUser = mapFechedDiscordUserToNewDiscordUser(await fetchGuildUser(guildId, discordUserId, env.DISCORD_TOKEN))
    if(isDiscordUserOnDB) {
      await discordUserService.updateUser(transaction, discordUser)
    } else {
      await discordUserService.createUser(transaction, discordUser)
    }

    return {
      id: undefined,
      gameId: undefined,
      isStaffPlayer: false,
      discordUserId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name,
      nickname: discordUser.server_nick,
    } as PlayerOnTable
  }
}

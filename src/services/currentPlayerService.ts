import { CurrentPlayerRepository } from '../repositories/currentPlayerRepository'
import { NewCurrentPlayer } from '../models/currentPlayerModel'
import { DBTransaction } from '../types/transactionType'

export class CurrentPlayerService {
  private repo = new CurrentPlayerRepository()

  async getByGame(transaction: DBTransaction, gameId: number) {
    return await this.repo.findAllByGameId(transaction, gameId)
  }

  async getByUser(transaction: DBTransaction, discordId: string) {
    return await this.repo.findByDiscordUser(transaction, discordId)
  }

  async getEntryByTableAndUser(transaction: DBTransaction, discordId: string, gameId: number) {
    return await this.repo.findByDiscordUserAndTableId(transaction, discordId, gameId)
  }

  async addPlayer(transaction: DBTransaction, data: NewCurrentPlayer) {
    await this.repo.add(transaction, data)
  }

  async removePlayer(transaction: DBTransaction, id: number) {
    await this.repo.remove(transaction, id)
  }

  async removeByGameAndUser(transaction: DBTransaction, gameId: number, discordId: string) {
    await this.repo.removeByGameAndUser(transaction, gameId, discordId)
  }
}

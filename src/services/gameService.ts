import { GameRepository } from '../repositories/gameRepository'
import { Game, NewGame } from '../models/gameModel'
import { DBTransaction } from '../types/transactionType'
import { CommandError } from '../errors/commandError'
import { ERROR_TABLE_NOT_FOUND } from '../constants/errorMessages'

export class GameService {
  private repo = new GameRepository()

  async createGame(transaction: DBTransaction, data: NewGame): Promise<number> {
    return await this.repo.create(transaction, data)
  }

  async getGameById(transaction: DBTransaction, id: number): Promise<Game> {
    const game = await this.repo.findById(transaction, id)
    if (!game || !game.is_active) throw new CommandError(ERROR_TABLE_NOT_FOUND);
    return game
  }

  async getTableBySearch(transaction: DBTransaction, search: string): Promise<{ name: string; value: string }[]> {
    return await this.repo.findTableBySearch(transaction, search)
  }

  async updateGame(transaction: DBTransaction, id: number, data: Partial<NewGame>) {
    await this.repo.update(transaction, id, data)
  }

  async deleteGame(transaction: DBTransaction, id: number): Promise<void> {
    await this.repo.delete(transaction, id)
  }
}

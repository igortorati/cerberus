import { JoinOriginRepository } from '../repositories/joinOriginRepository'
import { JoinOrigin, NewJoinOrigin } from '../models/joinOriginModel'
import { DBTransaction } from '../types/transactionType'
import { CommandError } from '../errors/commandError'
import { ERROR_ORIGIN_NOT_FOUND } from '../constants/errorMessages'

export class JoinOriginService {
  private repo = new JoinOriginRepository()

  async createOrigin(transaction: DBTransaction, joinOriginGame: NewJoinOrigin): Promise<number> {
    return await this.repo.create(transaction, joinOriginGame)
  }

  async getDistinctOrigins(transaction: DBTransaction): Promise<string[]> {
    return await this.repo.findDistinctOrigins(transaction)
  }

  async getAllOrigins(transaction: DBTransaction): Promise<JoinOrigin[]> {
    return await this.repo.findAll(transaction)
  }

  async getOriginById(transaction: DBTransaction, id: number): Promise<JoinOrigin> {
    const origin = await this.repo.findByUid(transaction, id)
    if(!origin)
      throw new CommandError(ERROR_ORIGIN_NOT_FOUND)
    return origin
  }

  async existsOrigin(
    transaction: DBTransaction,
    joinOriginToSearch: NewJoinOrigin,
  ): Promise<boolean> {
    return await this.repo.exists(transaction, joinOriginToSearch)
  }

  async updateOrigin(transaction: DBTransaction, id: number, originName: string): Promise<void> {
    await this.repo.update(transaction, id, { origin: originName })
  }

  async deleteOrigin(transaction: DBTransaction, id: number): Promise<void> {
    await this.repo.delete(transaction, id)
  }
}

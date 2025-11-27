import { SessionRepository } from '../repositories/sessionRepository'
import { NewSession, Session } from '../models/sessionModel'
import { DBTransaction } from '../types/transactionType'
import { CommandError } from '../errors/commandError'
import { ERROR_SESSION_ALREADY_SCHEDULED } from '../constants/errorMessages'

export class SessionService {
  private repo = new SessionRepository()

  async createSession(transaction: DBTransaction, data: NewSession) {
    try {
      return await this.repo.create(transaction, data)
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY')
        throw new CommandError(ERROR_SESSION_ALREADY_SCHEDULED)

      throw err
    }
  }

  async findByGameAndDate(transaction: DBTransaction, gameId: number, date: Date, type: string): Promise<Session | undefined> {
    return await this.repo.findByGameAndDate(transaction, gameId, date, type)
  }

  async findActiveByGameAndWeekday(transaction: DBTransaction, gameId: number, weekday: number) {
    return await this.repo.findActiveByGameAndWeekday(transaction, gameId, weekday);
  }

  async findCanceledByGameAndWeekday(transaction: DBTransaction, gameId: number, weekday: number) {
    return await this.repo.findCanceledByGameAndWeekday(transaction, gameId, weekday);
  }

  async deleteSession(transaction: DBTransaction, sessionId: number) {
    return await this.repo.deleteSession(transaction, sessionId);
  }
}

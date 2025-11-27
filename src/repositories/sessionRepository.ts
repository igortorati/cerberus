import { DBTransaction } from '../types/transactionType'
import { session, NewSession } from '../models/sessionModel'
import { and, eq, not, sql } from 'drizzle-orm';
import { SESSION_TYPE } from '../enums/sessionType';

export class SessionRepository {
  async create(transaction: DBTransaction, data: NewSession): Promise<number> {
    const [inserted] = await transaction.insert(session).values(data)
    return inserted.insertId
  }

  async findByGameAndDate(transaction: DBTransaction, gameId: number, date: Date, type: string) {
    return transaction.query.session.findFirst({
      where: 
        and(eq(session.game_id, gameId), eq(session.date, date), eq(session.type, type))
    });
  }

  async findActiveByGameAndWeekday(transaction: DBTransaction, gameId: number, weekday: number) {
    return transaction.query.session.findFirst({
      where: 
        and(
          eq(session.game_id, gameId),
          eq(session.type, SESSION_TYPE.SCHEDULED),
          not(eq(session.type, SESSION_TYPE.CANCELED)),
          sql`DAYOFWEEK(${session.date}) = ${weekday + 1}`
        ),
    });
  }

  async findCanceledByGameAndWeekday(transaction: DBTransaction, gameId: number, weekday: number) {
    return transaction.query.session.findFirst({
      where:
        and(
          eq(session.game_id, gameId),
          eq(session.type, SESSION_TYPE.CANCELED),
          sql`DAYOFWEEK(${session.date}) = ${weekday + 1}`
        ),
    });
  }

  async deleteSession(transaction: DBTransaction, sessionId: number) {
    return transaction.delete(session).where(eq(session.id, sessionId));
  }
}

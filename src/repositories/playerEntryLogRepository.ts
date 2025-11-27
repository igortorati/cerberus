import { eq } from 'drizzle-orm';
import { player_entry_log, NewPlayerEntryLog } from '../models/playerEntryLogModel';
import { DBTransaction } from '../types/transactionType';

export class PlayerEntryLogRepository {
  async create(transaction: DBTransaction, entry: NewPlayerEntryLog): Promise<number> {
    const result = await transaction.insert(player_entry_log).values(entry);
    return result[0].insertId as number;
  }

  async getById(transaction: DBTransaction, id: number) {
    const result = await transaction.select().from(player_entry_log).where(eq(player_entry_log.id, id));
    return result[0] || null;
  }

  async listAll(transaction: DBTransaction) {
    return transaction.select().from(player_entry_log);
  }

  async listByGame(transaction: DBTransaction, gameId: number) {
    return transaction.select().from(player_entry_log).where(eq(player_entry_log.game_id, gameId));
  }

  async deleteById(transaction: DBTransaction, id: number): Promise<void> {
    await transaction.delete(player_entry_log).where(eq(player_entry_log.id, id));
  }
}

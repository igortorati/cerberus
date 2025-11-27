import { PlayerEntryLogRepository } from '../repositories/playerEntryLogRepository';
import { NewPlayerEntryLog } from '../models/playerEntryLogModel';
import { DBTransaction } from '../types/transactionType';

export class PlayerEntryLogService {
  private repository: PlayerEntryLogRepository;

  constructor() {
    this.repository = new PlayerEntryLogRepository();
  }

  async createLog(transaction: DBTransaction, entry: NewPlayerEntryLog): Promise<number> {
    return await this.repository.create(transaction, entry);
  }

  async getLogById(transaction: DBTransaction, id: number) {
    return await this.repository.getById(transaction, id);
  }

  async listAllLogs(transaction: DBTransaction) {
    return await this.repository.listAll(transaction);
  }

  async listLogsByGame(transaction: DBTransaction, gameId: number) {
    return await this.repository.listByGame(transaction, gameId);
  }

  async deleteLog(transaction: DBTransaction, id: number): Promise<void> {
    await this.repository.deleteById(transaction, id);
  }
}

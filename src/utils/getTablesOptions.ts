import { GameService } from '../services/gameService'
import { DBTransaction } from '../types/transactionType';

export async function getTablesOptions(
transaction: DBTransaction, valueToSearch: string, guildId: string | undefined,
): Promise<{ name: string; value: string }[]> {
  const gameService = new GameService()
  return await gameService.getTableBySearch(transaction, valueToSearch, guildId)
}

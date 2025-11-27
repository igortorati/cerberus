import { GameService } from '../services/gameService'
import { DBTransaction } from '../types/transactionType';

export async function getTablesOptions(
  transaction: DBTransaction,
  valueToSearch: string,
): Promise<{ name: string; value: string }[]> {
  const gameService = new GameService()
  return await gameService.getTableBySearch(transaction, valueToSearch)
}

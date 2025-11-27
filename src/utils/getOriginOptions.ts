import { JoinOriginService } from '../services/joinOriginService'
import { DBTransaction } from '../types/transactionType';

export async function getOriginOptions(
  transaction: DBTransaction,
  valueToSearch: string,
): Promise<{ name: string; value: string }[]> {
  const joinOriginService = new JoinOriginService()
  const origins = await joinOriginService.getDistinctOrigins(transaction)

  return origins
    .filter((origin) => origin.startsWith(valueToSearch))
    .map((origin) => {
      return {
        name: origin,
        value: origin,
      }
    })
}

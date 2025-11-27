import { JoinOriginService } from '../services/joinOriginService'
import { DBTransaction } from '../types/transactionType';

export async function getJoinOriginOptions(
  transaction: DBTransaction,
  valueToSearch: string,
): Promise<{ name: string; value: string }[]> {
  const joinOriginService = new JoinOriginService()
  const origins = await joinOriginService.getAllOrigins(transaction)
  const options = origins.map((joinOrigin) => {
    return {
      name: `${joinOrigin.origin} - ${joinOrigin.group_name}`,
      value: joinOrigin.id.toString(),
    }
  });

  return options.filter((joinOrigin) => joinOrigin.name.startsWith(valueToSearch));
}

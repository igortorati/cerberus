import { eq, and } from 'drizzle-orm'
import {
  joinOrigin,
  JoinOrigin,
  NewJoinOrigin,
} from '../models/joinOriginModel'
import { DBTransaction } from '../types/transactionType'
import { MAX_DISCORD_CHOICES } from '../constants/discordConstants'

export class JoinOriginRepository {
  async create(transaction: DBTransaction, newOrigin: NewJoinOrigin): Promise<number> {
    const [inserted] = await transaction
      .insert(joinOrigin)
      .values(newOrigin)
      .$returningId()
    return inserted.id
  }

  async findDistinctOrigins(transaction: DBTransaction): Promise<string[]> {
    const dataRetrieved = await transaction
      .selectDistinct({ origin: joinOrigin.origin })
      .from(joinOrigin)
      .limit(MAX_DISCORD_CHOICES)
    return dataRetrieved.map((origin) => origin.origin)
  }

  async findAll(transaction: DBTransaction): Promise<JoinOrigin[]>{
    return transaction.select().from(joinOrigin).limit(MAX_DISCORD_CHOICES);
  }

  async findByUid(transaction: DBTransaction, id: number): Promise<JoinOrigin | undefined> {
    const [row] = await transaction
      .select()
      .from(joinOrigin)
      .where(eq(joinOrigin.id, id))
    return row
  }

  async exists(transaction: DBTransaction, joinOriginToSearch: NewJoinOrigin): Promise<boolean> {
    const result = await transaction
      .select({ id: joinOrigin.id })
      .from(joinOrigin)
      .where(
        and(
          eq(joinOrigin.origin, joinOriginToSearch.origin),
          eq(joinOrigin.group_name, joinOriginToSearch.group_name),
        ),
      )
      .limit(1)

    return result.length > 0
  }

  async update(
    transaction: DBTransaction,
    id: number,
    data: Partial<NewJoinOrigin>,
  ): Promise<void> {
    await transaction.update(joinOrigin).set(data).where(eq(joinOrigin.id, id))
  }

  async delete(transaction: DBTransaction, id: number): Promise<void> {
    await transaction.delete(joinOrigin).where(eq(joinOrigin.id, id))
  }
}

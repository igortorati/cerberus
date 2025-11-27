import { eq, inArray } from 'drizzle-orm'
import { discordUser, DiscordUser, NewDiscordUser } from '../models/discordUserModel'
import { DBTransaction } from '../types/transactionType'

export class DiscordUserRepository {
  async create(transaction: DBTransaction, newUser: NewDiscordUser): Promise<void> {
    await transaction.insert(discordUser).values(newUser)
  }

  async findById(transaction: DBTransaction, id: string): Promise<DiscordUser | undefined> {
    const [row] = await transaction.select().from(discordUser).where(eq(discordUser.id, id))
    return row
  }

  async findAllByIds(transaction: DBTransaction, ids: string[]) {
    if (!ids || ids.length === 0) return []

    const users = await transaction
      .select()
      .from(discordUser)
      .where(inArray(discordUser.id, ids))

    return users
  }

  async update(transaction: DBTransaction, id: string, data: Partial<NewDiscordUser>): Promise<void> {
    await transaction.update(discordUser).set(data).where(eq(discordUser.id, id))
  }

  async findAll(transaction: DBTransaction): Promise<DiscordUser[]> {
    const users = await transaction.select().from(discordUser)
    return users
  }
}

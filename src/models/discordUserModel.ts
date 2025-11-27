import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm'
import { currentPlayer } from './currentPlayerModel'
import { game } from './gameModel'

export const discordUser = mysqlTable('discord_user', {
  id: varchar('id', { length: 25 }).primaryKey(),
  global_name: varchar('global_name', { length: 100 }).notNull(),
  server_nick: varchar('server_nick', { length: 100 }),
})

export const discordUserRelations = relations(discordUser, ({ many }) => ({
  currentPlayers: many(currentPlayer),
  gamesAsDM: many(game),
}))

export type DiscordUser = InferSelectModel<typeof discordUser>
export type NewDiscordUser = InferInsertModel<typeof discordUser>

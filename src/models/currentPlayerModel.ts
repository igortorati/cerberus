import { mysqlTable, int, varchar, boolean } from 'drizzle-orm/mysql-core'
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm'
import { game } from './gameModel'
import { discordUser } from './discordUserModel'

export const currentPlayer = mysqlTable('current_player', {
  id: int('id').autoincrement().primaryKey(),
  game_id: int('game_id')
    .notNull()
    .references(() => game.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  discord_player_id: varchar('discord_player_id', { length: 25 })
    .notNull()
    .references(() => discordUser.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  is_staff: boolean('is_staff').notNull().default(false),
})

export const currentPlayerRelations = relations(currentPlayer, ({ one }) => ({
  playerUser: one(discordUser, {
    fields: [currentPlayer.discord_player_id],
    references: [discordUser.id],
  }),
  gamePlayed: one(game, {
    fields: [currentPlayer.game_id],
    references: [game.id],
  }),
}))

export type CurrentPlayer = InferSelectModel<typeof currentPlayer>
export type NewCurrentPlayer = InferInsertModel<typeof currentPlayer>

import { mysqlTable, int, date, text, varchar, mysqlEnum, timestamp } from 'drizzle-orm/mysql-core'
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm'
import { game } from './gameModel'
import { SESSION_TYPE } from '../enums/sessionType'

export const session = mysqlTable('session', {
  id: int('id').autoincrement().primaryKey(),
  game_id: int('game_id')
    .notNull()
    .references(() => game.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  date: date('date').notNull(),
  type: mysqlEnum('type',
      Object.keys(SESSION_TYPE) as [string, ...string[]],
    ).notNull(),
  reason: text('reason'),
  created_by_discord_id: varchar('created_by_discord_id', { length: 25 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

export const sessionRelations = relations(session, ({ one }) => ({
  game: one(game, {
    fields: [session.game_id],
    references: [game.id],
  }),
}))

export type Session = InferSelectModel<typeof session>
export type NewSession = InferInsertModel<typeof session>

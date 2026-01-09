import { mysqlTable, serial, varchar, boolean, int, text, mysqlEnum, timestamp } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { game } from './gameModel';
import { joinOrigin } from './joinOriginModel';

export const player_entry_log = mysqlTable('player_entry_log', {
  id: serial('id').primaryKey(),
  reported_by_discord_id: varchar('reported_by_discord_id', { length: 25 }).notNull(),
  reported_at: timestamp('reported_at').defaultNow().notNull(),
  discord_player_id: varchar('discord_player_id', { length: 25 }).notNull(),
  operation: mysqlEnum('operation', ['entry', 'exit']).notNull(),
  is_staff_player: boolean('is_staff_player').default(false).notNull(),
  game_id: int('game_id').notNull(),
  leave_reason: text('leave_reason'),
  join_from_id: int('join_from_id'),
  note: text('note'),
});

export const playerEntryLogRelations = relations(player_entry_log, ({ one }) => ({
  game: one(game, {
    fields: [player_entry_log.game_id],
    references: [game.id],
  }),
  join_origin: one(joinOrigin, {
    fields: [player_entry_log.join_from_id],
    references: [joinOrigin.id],
  }),
}));

export type PlayerEntryLog = typeof player_entry_log.$inferSelect;
export type NewPlayerEntryLog = typeof player_entry_log.$inferInsert;

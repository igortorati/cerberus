import {
  mysqlTable,
  int,
  varchar,
  boolean,
  decimal,
  time,
  date,
  mysqlEnum,
  serial,
} from 'drizzle-orm/mysql-core'
import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm'
import { FREQUENCY } from '../enums/frequency'
import { DAY_OF_WEEK } from '../enums/daysOfWeek'
import { discordUser } from './discordUserModel'
import { currentPlayer } from './currentPlayerModel'

export const game = mysqlTable('game', {
  id: serial('id').primaryKey(),

  name: varchar('name', { length: 150 }).notNull(),
  dm_discord_id: varchar('dm_discord_id', { length: 25 }).notNull(),

  max_players: int('max_players').notNull(),
  current_players: int('current_players').default(0).notNull(),
  current_staff_players: int('current_staff_players').default(0).notNull(),
  max_staff_players: int('max_staff_players').default(1).notNull(),

  text_channel_id: varchar('text_channel_id', { length: 25 }).notNull(),
  voice_channel_id: varchar('voice_channel_id', { length: 25 }).notNull(),

  role_id: varchar('role_id', { length: 25 }).notNull(),

  frequency: mysqlEnum(
    'frequency',
    Object.keys(FREQUENCY) as [string, ...string[]],
  ).notNull(),

  day_of_week: mysqlEnum(
    'day_of_week',
    Object.keys(DAY_OF_WEEK) as [string, ...string[]],
  ).notNull(),
  time: time('time').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),

  start_date: date('start_date'),
  closed_date: date('closed_date'),

  is_active: boolean('is_active').default(true),
  generate_calendar: boolean('generate_calendar').default(true),

  created_by_discord_id: varchar('created_by_discord_id', { length: 25 }),

  is_one_shot: boolean('is_one_shot').notNull(),
  is_ongoing: boolean('is_ongoing').notNull().default(false),
  is_being_promoted: boolean('is_being_promoted').notNull().default(false),
  is_ddal: boolean('is_ddal').notNull().default(false),
})

export const gameRelations = relations(game, ({ one, many }) => ({
  dmUser: one(discordUser, {
    fields: [game.dm_discord_id],
    references: [discordUser.id],
  }),
  createdByUser: one(discordUser, {
    fields: [game.created_by_discord_id],
    references: [discordUser.id],
  }),
  currentPlayers: many(currentPlayer),
}))

export type Game = InferSelectModel<typeof game>
export type NewGame = InferInsertModel<typeof game>

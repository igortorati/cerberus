import { mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core'
import { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export const joinOrigin = mysqlTable('join_origin', {
  id: serial('id').primaryKey(),
  origin: varchar('origin', { length: 150 }).notNull(),
  group_name: varchar('group_name', { length: 150 }).notNull(),
})

export type JoinOrigin = InferSelectModel<typeof joinOrigin>
export type NewJoinOrigin = InferInsertModel<typeof joinOrigin>

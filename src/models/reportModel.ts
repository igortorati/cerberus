import { mysqlTable, serial, varchar, json, timestamp } from 'drizzle-orm/mysql-core'
import { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export const reportCache = mysqlTable('report_cache', {
  id: serial('id').primaryKey(),
  report_json: json('report_json').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export type ReportCache = InferSelectModel<typeof reportCache>
export type NewReportCache = InferInsertModel<typeof reportCache>

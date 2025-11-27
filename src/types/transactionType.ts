import { MySql2QueryResultHKT, MySql2PreparedQueryHKT } from 'drizzle-orm/mysql2'
import { MySqlTransaction } from 'drizzle-orm/mysql-core'
import { ExtractTablesWithRelations } from 'drizzle-orm'
import * as schema from '../models'

export type DBTransaction = MySqlTransaction<
  MySql2QueryResultHKT,
  MySql2PreparedQueryHKT,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>

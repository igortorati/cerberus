import { drizzle } from 'drizzle-orm/mysql2'
import { createConnection } from 'mysql2/promise'
import type { Env } from '../interfaces/envInterface'
import * as schema from '../models'


export async function initDB(env: Env) {
  const connection = await createConnection({
    host: env.HYPERDRIVE.host,
    user: env.HYPERDRIVE.user,
    password: env.HYPERDRIVE.password,
    database: env.HYPERDRIVE.database,
    port: env.HYPERDRIVE.port,
    disableEval: true,
  })
  const db = drizzle(connection, { schema, mode: 'default' })
  console.log('✅ Drizzle connected via Hyperdrive binding')

  return db
}

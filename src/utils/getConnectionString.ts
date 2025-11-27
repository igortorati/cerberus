import { Env } from '../interfaces/envInterface'

export function getConnectionString(env: Env) {
  return `mysql://${env.HYPERDRIVE.user}:${env.HYPERDRIVE.password}@${env.HYPERDRIVE.host}:${env.HYPERDRIVE.port}/${env.HYPERDRIVE.database}`
}

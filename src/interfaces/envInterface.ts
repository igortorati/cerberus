import { z } from 'zod'

export const EnvSchema = z.object({
  DISCORD_APPLICATION_ID: z.string(),
  DISCORD_PUBLIC_KEY: z.string(),
  DISCORD_TOKEN: z.string(),

  HYPERDRIVE: z.union([
    z.object({
      host: z.string(),
      user: z.string(),
      password: z.string(),
      database: z.string(),
      port: z.coerce.number(),
    }),
    z.any(),
  ]),
  
  GENERAL_ROLE_ID: z.string(),
  GUARDIAN_ROLE_ID: z.string(),
})

export type Env = z.infer<typeof EnvSchema>

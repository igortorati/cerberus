
import { FREQUENCY } from '../../enums/frequency'
import { DAY_OF_WEEK } from '../../enums/daysOfWeek'
import { parseDate } from '../getDateFromString'
import { INVALID_DATE_FORMAT, INVALID_DAY_OF_WEEK, INVALID_DM_ID, INVALID_FREQUENCY, INVALID_MAX_PLAYER_TOO_FEW, INVALID_MAX_PLAYERS_VALUE, INVALID_MAX_STAFF_PLAYERS_NEGATIVE, INVALID_PRICE_NEGATIVE, INVALID_ROLE_ID, INVALID_TABLE_NAME_TOO_LONG, INVALID_TABLE_NAME_TOO_SHORT, INVALID_TEXT_CHANNEL_ID, INVALID_TIME_FORMAT, INVALID_VOICE_CHANNEL_ID } from '../../constants/errorMessages'
import { validateTimeRegex } from './validateTime'
import { validateDate } from './validateDate'
import { discordIdRegex } from './validateDiscordIds'
import { CommandError } from '../../errors/commandError'
import { z } from '../zodConfig'

export const inputEditGameDataValidator = z.object({
  mesa: z
    .number()
    .int()
    .min(0, INVALID_MAX_STAFF_PLAYERS_NEGATIVE),

  nome_mesa: z
    .string()
    .min(3, INVALID_TABLE_NAME_TOO_SHORT)
    .max(150, INVALID_TABLE_NAME_TOO_LONG)
    .optional(),

  mestre: z
    .string()
    .regex(discordIdRegex, INVALID_DM_ID)
    .optional(),

  vagas_totais: z
    .number()
    .int(INVALID_MAX_PLAYERS_VALUE)
    .min(1, INVALID_MAX_PLAYER_TOO_FEW)
    .optional(),

  vagas_staff: z
    .number()
    .int()
    .min(0, INVALID_MAX_STAFF_PLAYERS_NEGATIVE)
    .optional()
    .default(0)
    .optional(),

  canal_texto: z
    .string()
    .regex(discordIdRegex, INVALID_TEXT_CHANNEL_ID)
    .optional(),

  canal_voz: z
    .string()
    .regex(discordIdRegex, INVALID_VOICE_CHANNEL_ID)
    .optional(),

  role: z
    .string()
    .regex(discordIdRegex, INVALID_ROLE_ID)
    .optional(),

  frequencia: z
    .string()
    .refine((val) => (Object.values(FREQUENCY) as string[]).includes(val), INVALID_FREQUENCY)
    .optional(),

  dia_da_semana: z
    .string()
    .refine((val) => (Object.values(DAY_OF_WEEK) as string[]).includes(val), INVALID_DAY_OF_WEEK)
    .optional(),

  horario: z
    .string()
    .regex(validateTimeRegex, INVALID_TIME_FORMAT)
    .optional(),

  valor: z
    .number()
    .min(0, INVALID_PRICE_NEGATIVE)
    .optional(),

  data_primeira_sessao: z
    .string()
    .refine((val) => validateDate(val) && !!parseDate(val), INVALID_DATE_FORMAT)
    .transform((val) => {
      const parsed = parseDate(val)
      if (!parsed) throw new CommandError(INVALID_DATE_FORMAT)
      return parsed
    })
    .optional(),

  one_shot: z
    .boolean()
    .optional()
    .default(false),
})

export type ValidatedEditGameInput = z.infer<typeof inputEditGameDataValidator>
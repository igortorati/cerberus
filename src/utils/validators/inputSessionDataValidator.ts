import { parseDate } from '../getDateFromString'
import { validateDate } from './validateDate'
import {
  INVALID_DATE_FORMAT,
  INVALID_ID_MESSAGE,
  INVALID_REASON_TOO_LONG,
} from '../../constants/errorMessages'
import { CommandError } from '../../errors/commandError'
import { z } from '../zodConfig'

export const inputSessionDataValidator = z.object({
  mesa: z
    .number({
      invalid_type_error: INVALID_ID_MESSAGE,
    })
    .int(INVALID_ID_MESSAGE)
    .positive(INVALID_ID_MESSAGE),

  data: z
    .string()
    .refine(
      (val) => validateDate(val) && !!parseDate(val),
      INVALID_DATE_FORMAT
    )
    .transform((val) => {
      const parsed = parseDate(val)
      if (!parsed) throw new CommandError(INVALID_DATE_FORMAT)
      return parsed
    }),

  motivo: z
    .string()
    .max(1000, INVALID_REASON_TOO_LONG)
    .optional()
    .nullable(),
})

export type ValidatedSessionInputData = z.infer<typeof inputSessionDataValidator>

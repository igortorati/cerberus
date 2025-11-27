import { InteractionResponseType } from 'discord-interactions'
import { JsonResponse } from '../utils/jsonResponse'
import { APIApplicationCommandAutocompleteInteraction } from 'discord-api-types/v10'
import { daysOfWeekOptions } from '../utils/getDaysOfWeekOptions'
import { frequencyOptions } from '../utils/getFrequencyOptions'
import {
  DAYS_OF_WEEK_OPTION_NAME,
  FREQUENCY_OPTION_NAME,
  JOIN_ORIGIN_OPTION_NAME,
  ORIGIN_OPTION_NAME,
  TABLE_OPTION_NAME,
} from '../constants/autocompleteOptionsConstants'
import { getTablesOptions } from '../utils/getTablesOptions'
import { AutocompleteOption } from '../interfaces/autocompleteOptionInterface'
import { getOriginOptions } from './getOriginOptions'
import { getJoinOriginOptions } from './getJoinOriginOptions'
import { DBTransaction } from '../types/transactionType'

export async function tableDataAutocomplete(
  transaction: DBTransaction,
  interaction: APIApplicationCommandAutocompleteInteraction,
): Promise<Response> {
  const options = interaction.data.options as AutocompleteOption[] | undefined
  const focusedOption = options?.find((opt) => opt?.focused)
  const valueToSearch = focusedOption?.value
    ? focusedOption.value.toString().toLowerCase()
    : ''

  let choices: Array<{ name: string; value: string }> = []

  switch (focusedOption?.name) {
    case DAYS_OF_WEEK_OPTION_NAME:
      choices = daysOfWeekOptions(valueToSearch)
      break

    case FREQUENCY_OPTION_NAME:
      choices = frequencyOptions(valueToSearch)
      break

    case TABLE_OPTION_NAME:
      choices = await getTablesOptions(transaction, valueToSearch)
      break

    case ORIGIN_OPTION_NAME:
      choices = await getOriginOptions(transaction, valueToSearch)
      break

    case JOIN_ORIGIN_OPTION_NAME:
      choices = await getJoinOriginOptions(transaction, valueToSearch)
      break

    default:
      choices = []
  }

  const response = new JsonResponse({
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: { choices },
  })
  return response
}

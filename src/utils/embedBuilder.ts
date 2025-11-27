import { APIEmbed } from 'discord-api-types/v10'
import { Game, NewGame } from '../models/gameModel'
import { formatFieldsToDiscordFormat } from './formatFieldsToDiscordFormat'
import { FIELD_LABELS } from '../constants/fieldLabelsConstants'

interface EmbedField {
  name: string
  value: string
  inline?: boolean
}

interface EmbedOptions {
  title: string
  description?: string
  fields?: EmbedField[]
  footer?: { text: string }
  color?: number
}

export function EmbedBuilder({
  title,
  description,
  fields = [],
  footer,
  color = 0x5865f2,
}: EmbedOptions): APIEmbed {
  return {
    title,
    description,
    color,
    fields,
    footer,
  }
}

export function tableDataEmbedBuilder(gameData: Game, embedTitle: string): APIEmbed {
  const fields = (Object.entries(FIELD_LABELS) as Array<[keyof NewGame, string]>)
    .map(([key, label]) => {
    const value = formatFieldsToDiscordFormat(gameData[key], key);

    return {
      name: label,
      value,
      inline: true,
    };
  });

  return EmbedBuilder({
    title: embedTitle,
    fields,
    footer: { text: `🆔 ID da Mesa: ${gameData.id}` },
  });
} 
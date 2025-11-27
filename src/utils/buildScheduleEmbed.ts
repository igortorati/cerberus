import { NewSession } from "../models";
import { EmbedBuilder } from "./embedBuilder";
import { formatFieldsToDiscordFormat } from "./formatFieldsToDiscordFormat";

export function buildScheduleEmbed(title: string, session: NewSession, gameName: string, sessionId?: number) {
  const scheduledDate = formatFieldsToDiscordFormat(session.date, 'date');
  const embed = EmbedBuilder({
    title,
    fields: [
      { name: '🎲 Mesa', value: gameName, inline: true },
      { name: '🗓 Data', value: scheduledDate, inline: true },
      { name: '✍️ Ação realizada por', value: formatFieldsToDiscordFormat(session.created_by_discord_id, 'discordUser'), inline: true },
      ...(session.reason ? [{ name: '📝 Motivo', value: session.reason }] : []),
    ],
  });
  if (sessionId) {
    embed.footer = { text: `🆔 Sessão ID: ${sessionId}` };
  }
  return embed;
}
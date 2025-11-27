import { InteractionResponseType } from 'discord-interactions';
import { APIChatInputApplicationCommandInteraction, APIEmbed } from 'discord-api-types/v10';
import { JsonResponse } from '../../utils/jsonResponse';
import { extractInteractionData } from '../../utils/getInteractionOptions';
import { DBTransaction } from '../../types/transactionType';
import { CommandError } from '../../errors/commandError';
import { GameService } from '../../services/gameService';
import { SessionService } from '../../services/sessionService';
import { DAY_OF_WEEK } from '../../enums/daysOfWeek';
import { formatFieldsToDiscordFormat } from '../../utils/formatFieldsToDiscordFormat';
import { Game, NewSession, Session } from '../../models';
import { SESSION_TYPE } from '../../enums/sessionType';
import { buildScheduleEmbed } from '../../utils/buildScheduleEmbed';
import { buildSessionData } from '../../utils/buildSessionData';
import { ISessionInputData } from '../../interfaces/sessionInputDataInterface';
import { inputSessionDataValidator } from '../../utils/validators/inputSessionDataValidator';
import { Env } from '../../interfaces/envInterface';

export async function unscheduleSession(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction,
  env: Env
): Promise<Response> {
  
  const inputData = extractInteractionData<ISessionInputData>(interaction)
  const sessionService = new SessionService();
  const gameService = new GameService();
const validatedData = inputSessionDataValidator.safeParse(inputData);
  if (!validatedData.success) {
    const message = validatedData.error.issues[0]?.message ?? 'Dados inválidos.'
    throw new CommandError(message)
  }

  const sessionData = buildSessionData(interaction.member?.user?.id || env.DISCORD_APPLICATION_ID, validatedData.data, SESSION_TYPE.CANCELED);

  const game = await gameService.getGameById(transaction, sessionData.game_id);

  const existingSession = await sessionService.findByGameAndDate(transaction, game.id, sessionData.date, SESSION_TYPE.SCHEDULED);
  const embed = buildScheduleEmbed('✅ Sessão Desmarcada', sessionData, game.name);

  await processUnschedule(transaction, game, sessionData, sessionService, existingSession, embed);

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds: [embed] },
  });
}

async function processUnschedule(
  transaction: DBTransaction,
  game: Game,
  session: NewSession,
  sessionService: SessionService,
  existingSession: Session | undefined,
  embed: APIEmbed,
) {
  const formattedDate = formatFieldsToDiscordFormat(session.date, 'date');
  const targetDay = session.date.getUTCDay();
  const gameDayIndex = (Object.values(DAY_OF_WEEK) as string[]).indexOf(game.day_of_week);

  if (['Semanal', 'Quinzenal'].includes(game.frequency)) {
    if (!existingSession && targetDay !== gameDayIndex) {
      throw new CommandError(`ℹ️ Não existe sessão a desmarcar para "${game.name}" em ${formattedDate}.`);
    }

    const alreadyCanceled = await sessionService.findByGameAndDate(transaction, game.id, session.date, SESSION_TYPE.CANCELED);
    if (alreadyCanceled) {
      throw new CommandError(`ℹ️ A sessão já foi desmarcada para "${game.name}" em ${formattedDate}.`);
    }

    if (targetDay === gameDayIndex) {
      await sessionService.createSession(transaction, {
        game_id: game.id,
        type: SESSION_TYPE.CANCELED,
        date: session.date,
        reason: session.reason,
        created_by_discord_id: session.created_by_discord_id,
      });
      embed.title = `🗑️ Sessão semanal de "${game.name}" (${formattedDate}) cancelada.`;
      return;
    }

    if (existingSession && targetDay !== gameDayIndex) {
      await sessionService.deleteSession(transaction, existingSession.id);
      embed.title = `🗑️ Sessão extra removida para "${game.name}" (${formattedDate}).`;
      return;
    }
  }

  if (game.frequency === 'Agendada') {
    if (!existingSession) {
      throw new CommandError(`❌ Nenhuma sessão agendada encontrada para "${game.name}" em ${formattedDate}.`);
    }

    await sessionService.deleteSession(transaction, existingSession.id);
    embed.title = `🗑️ Sessão agendada removida para "${game.name}" (${formattedDate}).`;
  }
}

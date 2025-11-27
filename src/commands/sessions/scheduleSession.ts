import { InteractionResponseType } from 'discord-interactions';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { JsonResponse } from '../../utils/jsonResponse';
import { extractInteractionData } from '../../utils/getInteractionOptions';
import { DBTransaction } from '../../types/transactionType';
import { CommandError } from '../../errors/commandError';
import { GameService } from '../../services/gameService';
import { SessionService } from '../../services/sessionService';
import { formatFieldsToDiscordFormat } from '../../utils/formatFieldsToDiscordFormat';
import { SESSION_TYPE } from '../../enums/sessionType';
import { buildScheduleEmbed } from '../../utils/buildScheduleEmbed';
import { buildSessionData } from '../../utils/buildSessionData';
import { Game } from '../../models';
import { ISessionInputData } from '../../interfaces/sessionInputDataInterface';
import { DAY_OF_WEEK } from '../../enums/daysOfWeek';
import { inputSessionDataValidator } from '../../utils/validators/inputSessionDataValidator';
import { Env } from '../../interfaces/envInterface';

export async function scheduleSession(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction,
  env: Env
): Promise<Response> {
  const inputData = extractInteractionData<ISessionInputData>(interaction)

  const validatedData = inputSessionDataValidator.safeParse(inputData);
  if (!validatedData.success) {
    const message = validatedData.error.issues[0]?.message ?? 'Dados inválidos.'
    throw new CommandError(message)
  }

  const sessionData = buildSessionData(interaction.member?.user?.id || env.DISCORD_APPLICATION_ID, validatedData.data, SESSION_TYPE.SCHEDULED);

  const gameService = new GameService();
  const game = await gameService.getGameById(transaction, sessionData.game_id);

  const sessionService = new SessionService();
  const shouldCreateEntry = await shouldCreateSession(transaction, sessionService, game, sessionData.date);

  let sessionId;
  if(shouldCreateEntry)
    sessionId = await sessionService.createSession(transaction, sessionData);
  const embed = buildScheduleEmbed(shouldCreateEntry ? '✅ Sessão Marcada' : '✅ Sessão previamente Cancelada foi Remarcada', sessionData, game.name, sessionId);

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds: [embed] },
  });
}

async function shouldCreateSession(
  transaction: DBTransaction,
  sessionService: SessionService,
  game: Game,
  date: Date,
): Promise<boolean> {
  const scheduledDate = formatFieldsToDiscordFormat(date, 'date');

  if (['Semanal', 'Quinzenal'].includes(game.frequency)) {
    const sameDaySession = await sessionService.findByGameAndDate(transaction, game.id, date, SESSION_TYPE.SCHEDULED);
    if (sameDaySession) {
      throw new CommandError(`❌ Já existe uma sessão marcada para ${scheduledDate} em "${game.name}".`);
    }

    const targetDay = date.getUTCDay();
    const gameDayIndex = (Object.values(DAY_OF_WEEK) as string[]).indexOf(game.day_of_week);

    if (targetDay === gameDayIndex) {
      const canceled = await sessionService.findCanceledByGameAndWeekday(transaction, game.id, targetDay);
      if (canceled) {
        await sessionService.deleteSession(transaction, canceled.id);
        return false;
      }
      throw new CommandError(`❌ Já existe sessão marcada para o dia da semana (${game.day_of_week}).`);
    }
  } else if (game.frequency === 'Agendada') {
    const existing = await sessionService.findByGameAndDate(transaction, game.id, date, SESSION_TYPE.SCHEDULED);
    if (existing) {
      throw new CommandError(`❌ Já existe uma sessão marcada para ${scheduledDate} em "${game.name}".`);
    }
  }
  return true;
}
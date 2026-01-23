import { InteractionResponseType } from 'discord-interactions';
import { JsonResponse } from '../../utils/jsonResponse';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { extractInteractionData } from '../../utils/getInteractionOptions';
import { EmbedBuilder } from '../../utils/embedBuilder';
import { Env } from '../../interfaces/envInterface';
import { PlayerEntryLogService } from '../../services/playerEntryLogService';
import { GameService } from '../../services/gameService';
import { DBTransaction } from '../../types/transactionType';
import { CurrentPlayerService } from '../../services/currentPlayerService';
import { CommandError } from '../../errors/commandError';
import { removeRoleFromUser } from '../../utils/removeRoleFromUser';
import { Game } from '../../models/gameModel';
import { WarningMessage } from '../../interfaces/warningInterface';
import { PlayerEntryInputData } from '../../interfaces/playerEntryInputDataInterface';
import { NewPlayerEntryLog } from '../../models/playerEntryLogModel';
import { checkMemberHasTablePermissions } from '../../utils/checkMemberHasTablePermissions';
import { getDiscordMentionAndNickString } from '../../utils/getDiscordMentionAndNickString';
import { PlayerOnTable } from '../../interfaces/playerOnTableInterface';
import { DiscordUserService } from '../../services/discordUserService';
import { formatFieldsToDiscordFormat } from '../../utils/formatFieldsToDiscordFormat';
import { FIELD_LABELS } from '../../constants/fieldLabelsConstants';

export async function playerExit(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction,
  env: Env
): Promise<Response> {
  const inputData = extractInteractionData<PlayerEntryInputData>(interaction)
  const exitData = getPlayerExitFromPlayerEntryInputData(inputData, interaction.member?.user?.id || env.DISCORD_APPLICATION_ID)

  const { game, exitingPlayer } = await validateInput(transaction, exitData, interaction, env);

  const logService = new PlayerEntryLogService();
  const logId = await logService.createLog(transaction, exitData);

  const warning = await processPlayerExit(transaction, interaction, env, game, exitData, exitingPlayer.isStaffPlayer);

  const embed = createEmbed(exitData, game, exitingPlayer, logId, warning);

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds: [embed] },
  });
}

function getPlayerExitFromPlayerEntryInputData(entry: PlayerEntryInputData, id: string): NewPlayerEntryLog {
  return {
    reported_by_discord_id: id,
    discord_player_id: entry.jogador,
    operation: "exit",
    game_id: entry.mesa,
    is_staff_player: entry.vaga_staff,
    join_from_id: entry.origem_entrada,
    note: entry.nota,
    reported_at: new Date(),
    leave_reason: entry.motivo
  } as NewPlayerEntryLog
}

async function validateInput(transaction: DBTransaction, exitData: NewPlayerEntryLog, interaction: APIChatInputApplicationCommandInteraction, env: Env) {
  if (!exitData.discord_player_id || !exitData.game_id) {
    throw new CommandError("⚠️ Por favor, informe **jogador** e **mesa**.");
  }

  const gameService = new GameService();
  const currentPlayerService = new CurrentPlayerService();

  const game = await gameService.getGameById(transaction, exitData.game_id);

  const isDm = game.dm_discord_id === interaction.member?.user.id;
  const hasTablePermissions = checkMemberHasTablePermissions(interaction.member, env);

  if (!isDm && !hasTablePermissions) {
    throw new CommandError(`❌ Você não é o Mestre da Mesa "${game.name}"!`);
  }
  
  const exitingPlayer = await currentPlayerService.getEntryByTableAndUser(transaction, exitData.discord_player_id, exitData.game_id);
  if (!exitingPlayer) {
    const discordUserService = new DiscordUserService();
    const exitingPlayer = await discordUserService.createOrUpdateUser(transaction, exitData.discord_player_id, interaction.guild_id, env);
    throw new CommandError(`❌ O jogador ${getDiscordMentionAndNickString(exitingPlayer)} não está nesta mesa.`);
  }

  return { game, exitingPlayer };
}

async function processPlayerExit(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction,
  env: Env,
  game: Game,
  exitData: NewPlayerEntryLog,
  isStaff: boolean
): Promise<WarningMessage> {
  const gameService = new GameService();
  const currentPlayerService = new CurrentPlayerService();

  const updatedData = {
    current_players: Math.max(game.current_players - 1, 0),
    current_staff_players: isStaff
      ? Math.max((game.current_staff_players || 0) - 1, 0)
      : game.current_staff_players,
  };
  await gameService.updateGame(transaction, game.id, updatedData);

  if (!interaction.guild_id) throw new CommandError(`❌ Não foi possível encontrar a Guild.`);

  await currentPlayerService.removeByGameAndUser(transaction, exitData.game_id, exitData.discord_player_id);

  const warning = await removeRoleFromUser(interaction.guild_id, game.role_id, exitData.discord_player_id, env.DISCORD_TOKEN);

  return warning;
}

function createEmbed(
  exitData: NewPlayerEntryLog,
  game: Game,
  exitingPlayer: PlayerOnTable,
  logId: number,
  warning: WarningMessage
) {
  const fields = [
    { name: FIELD_LABELS.name, value: game.name, inline: true },
    { name: FIELD_LABELS.day_of_week, value: `${ game.day_of_week} (${game.time})`, inline: true },
    { name: FIELD_LABELS.dm_discord_id, value: formatFieldsToDiscordFormat(game.dm_discord_id, "discordUser"), inline: true },
    { name: '👤 Jogador', value: getDiscordMentionAndNickString(exitingPlayer), inline: true },
    { name: ':medical_symbol: Vaga de Staff?', value: exitingPlayer.isStaffPlayer ? 'Sim' : 'Não', inline: true },
  ];

  if (exitData.note) {
    fields.push({ name: '📝 Nota', value: exitData.note, inline: false });
  }

  if (warning && warning.hasWarning && warning.warningMessage) {
    fields.push({ name: '❗❗ Aviso', value: warning.warningMessage, inline: false });
  }

  return EmbedBuilder({
    title: (warning.hasWarning ? '⚠️' : '✅') + ' 🚪 Saída de Jogador Registrada',
    fields,
    footer: { text: `🆔 Log ID: ${logId}` },
  });
}

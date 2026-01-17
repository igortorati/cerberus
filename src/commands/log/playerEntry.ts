import { InteractionResponseType } from 'discord-interactions';
import { JsonResponse } from '../../utils/jsonResponse';
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { extractInteractionData } from '../../utils/getInteractionOptions';
import { EmbedBuilder } from '../../utils/embedBuilder';
import { Env } from '../../interfaces/envInterface';
import { PlayerEntryLogService } from '../../services/playerEntryLogService';
import { JoinOriginService } from '../../services/joinOriginService';
import { GameService } from '../../services/gameService';
import { DBTransaction } from '../../types/transactionType';
import { Game, NewCurrentPlayer } from '../../models';
import { CommandError } from '../../errors/commandError';
import { CurrentPlayerService } from '../../services/currentPlayerService';
import { DiscordUserService } from '../../services/discordUserService';
import { addRoleToUser } from '../../utils/addRoleToUser';
import { WarningMessage } from '../../interfaces/warningInterface';
import { JoinOrigin } from '../../models/joinOriginModel';
import { formatFieldsToDiscordFormat } from '../../utils/formatFieldsToDiscordFormat';
import { PlayerEntryInputData } from '../../interfaces/playerEntryInputDataInterface';
import { NewPlayerEntryLog } from '../../models/playerEntryLogModel';
import { isNull } from '../../utils/isNull';
import { FIELD_LABELS } from '../../constants/fieldLabelsConstants';

export async function playerEntry(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction,
  env: Env
): Promise<Response> {
  const entryService = new PlayerEntryLogService();
  const originService = new JoinOriginService();
  const gameService = new GameService();
  const inputData = extractInteractionData<PlayerEntryInputData>(interaction)
  
  const newPlayerEntry = getPlayerEntryFromPlayerEntryInputData(inputData, interaction.member?.user?.id || env.DISCORD_APPLICATION_ID)

  const game = await gameService.getGameById(transaction, newPlayerEntry.game_id);

  validateInput(newPlayerEntry, game)
  const origin = await originService.getOriginById(transaction, newPlayerEntry.join_from_id!);

  const logId = await entryService.createLog(transaction, newPlayerEntry);

  const warning = await addPlayer(transaction, game, newPlayerEntry, gameService, interaction, env)

  const embed = createEmbed(warning, game, origin, newPlayerEntry, logId)
  
  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds: [embed] },
  });
}

function getPlayerEntryFromPlayerEntryInputData(entry: PlayerEntryInputData, id: string): NewPlayerEntryLog {
  return {
    reported_by_discord_id: id,
    discord_player_id: entry.jogador,
    operation: "entry",
    game_id: entry.mesa,
    is_staff_player: entry.vaga_staff,
    join_from_id: entry.origem_entrada,
    note: entry.nota,
    reported_at: new Date()
  } as NewPlayerEntryLog
}

function hasVacancy(game: Game, isStaff: boolean = false): boolean {
  if (game.current_players < game.max_players) {
    if(isStaff) {
      return game.current_staff_players < game.max_staff_players
    }
    return true
  }
  return false
}

async function addPlayer(
  transaction: DBTransaction,
  game: Game,
  playerEntry: NewPlayerEntryLog,
  gameService: GameService,
  interaction: APIChatInputApplicationCommandInteraction,
  env: Env): Promise<WarningMessage> {
  const dataForUpdate: Partial<Game> = {
    current_players: ++game.current_players,
    current_staff_players: playerEntry.is_staff_player ? ++game.current_staff_players : undefined
  }
  await gameService.updateGame(transaction, game.id, dataForUpdate)
  
  const currentPlayer = new CurrentPlayerService();
  const discordUserService = new DiscordUserService();
  const checkUserAlreadyOnTable = await currentPlayer.getEntryByTableAndUser(transaction, playerEntry.discord_player_id, game.id)
  if(checkUserAlreadyOnTable) throw new CommandError(`O jogador <@${playerEntry.discord_player_id}> já está na mesa selecionada.`)

  const newCurrentPlayer: NewCurrentPlayer = {
    game_id: playerEntry.game_id,
    discord_player_id: playerEntry.discord_player_id,
    is_staff_player: playerEntry.is_staff_player,
  }

  await discordUserService.createOrUpdateUser(transaction, playerEntry.discord_player_id, interaction.guild_id, env)
  await currentPlayer.addPlayer(transaction, newCurrentPlayer)

  if(!interaction.guild_id) throw new CommandError(`Não foi possível encontrar a Guild`)
  return await addRoleToUser(interaction.guild_id, game.role_id, playerEntry.discord_player_id, env.DISCORD_TOKEN)
}

function validateInput(newPlayerEntry: NewPlayerEntryLog, game: Game) {
  if (isNull(newPlayerEntry.discord_player_id) || isNull(newPlayerEntry.game_id) || isNull(newPlayerEntry.join_from_id)) {
    throw new CommandError("⚠️ Por favor, informe **jogador**, **mesa** e **origem**.")
  }

  if(!hasVacancy(game, newPlayerEntry.is_staff_player)) {
    throw new CommandError(`Não existem mais vagas disponíveis em ${game.name}${newPlayerEntry.is_staff_player ? " para Staff." : "."}`)
  }
}

function createEmbed(warning: WarningMessage, game: Game, origin: JoinOrigin, playerEntry: NewPlayerEntryLog, logId: number) {
  const fields = [
      { name: FIELD_LABELS.name, value: game.name, inline: true },
      { name: FIELD_LABELS.day_of_week, value: `${ game.day_of_week} (${game.time})`, inline: true },
      { name: FIELD_LABELS.dm_discord_id, value: formatFieldsToDiscordFormat(game.dm_discord_id, "discordUser"), inline: true },
      { name: '👤 Jogador', value: formatFieldsToDiscordFormat(playerEntry.discord_player_id, "discordUser"), inline: true },
      { name: '🌐 Origem', value: `${origin.origin} (${origin.group_name})`, inline: true },
      { name: ':medical_symbol: Vaga de Staff?', value: playerEntry.is_staff_player ? 'Sim' : 'Não', inline: true },
    ]

  if (playerEntry.note) {
      fields.push({ name: '📝 Nota', value: playerEntry.note, inline: false });
  }

  if (warning && warning.hasWarning && warning.warningMessage) {
    fields.push({ name: '❗❗ Aviso', value: warning.warningMessage, inline: false})
  }

  return EmbedBuilder({
    title: (warning.hasWarning ? '⚠️' : '✅') + ' Entrada de Jogador Registrada',
    fields,
    footer: { text: `🆔 Log ID: ${logId}.` },
  });
}
import { APIGuildMember } from "discord.js";
import { CommandError } from "../errors/commandError";
import { NewDiscordUser } from "../models/discordUserModel";

export function mapFechedDiscordUserToNewDiscordUser (fetchedDiscordUser: APIGuildMember) : NewDiscordUser {
  if (fetchedDiscordUser.user.bot)
    throw new CommandError("Não é possível atribuir um bot como mestre ou jogador.")
  return {
    id: fetchedDiscordUser.user.id,
    global_name: fetchedDiscordUser.user.global_name || fetchedDiscordUser.user.username,
    server_nick: fetchedDiscordUser.nick,
  }
}
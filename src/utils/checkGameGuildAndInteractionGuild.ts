import { GUILD_ID_NOT_FOUND_IN_INTERACTION, GUILD_ID_NOT_THE_SAME_AS_INTERACTION_GUILD_ID } from "../constants/errorMessages";
import { CommandError } from "../errors/commandError";
import { isNull } from "./isNull"

export function checkGameGuildAndInteractionGuild(
  gameGuild: string,
  interactionGuild: string | undefined
): void {
  if (isNull(interactionGuild)) throw new CommandError(GUILD_ID_NOT_FOUND_IN_INTERACTION);

  if(gameGuild != interactionGuild) throw new CommandError(GUILD_ID_NOT_THE_SAME_AS_INTERACTION_GUILD_ID);
}

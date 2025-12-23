import { WarningMessage } from "../interfaces/warningInterface"

export async function removeRoleFromUser(
  guildId: string | undefined,
  roleId: string,
  discordUserId: string,
  discordToken: string
): Promise<WarningMessage> {
  if (roleId && discordUserId) {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bot ${discordToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      let warningMessage = `Falha ao remover role <@&${roleId}> do jogador <@${discordUserId}> é necessário remove-la manualmente.`
      if(response.status === 403)
        warningMessage = warningMessage + ` O Bot não tem acesso à role informada, verifique a hierarquia de roles do servidor.`
      return {
        hasWarning: true,
        warningMessage 
      }
    }
    console.log(
      `✅ Role ${roleId} removida ao jogador ${discordUserId}`
    )
    return {
      hasWarning: false,
      warningMessage: null
    }
  }
  return {
    hasWarning: true,
    warningMessage: "Role ou Usuário não encontrado, é necessário remover a role manualmente."
  }
}

import dotenv from 'dotenv'
import process from 'node:process'
import {
  EDIT_TABLE_COMMAND,
  INVITE_COMMAND,
  CREATE_TABLE_COMMAND,
  DELETE_TABLE_COMMAND,
  GET_TABLE_COMMAND,
  CREATE_JOIN_ORIGIN_COMMAND,
  PLAYER_ENTRY_COMMAND,
  PLAYER_LEAVE_COMMAND,
} from './commandsMetadata'

/**
 * Este script é destinado a ser executado no terminal e não é usado pelo servidor.
 * Ele usa primitivas Node.js e deve ser executado apenas uma vez.
 */

dotenv.config({ path: '.dev.vars' })

const token: string | undefined = process.env.DISCORD_TOKEN
const applicationId: string | undefined = process.env.DISCORD_APPLICATION_ID

if (!token) {
  throw new Error('A variável de ambiente DISCORD_TOKEN é obrigatória.')
}

if (!applicationId) {
  throw new Error(
    'A variável de ambiente DISCORD_APPLICATION_ID é obrigatória.',
  )
}

const url = `https://discord.com/api/v10/applications/${applicationId}/commands`

interface DiscordCommand {
  name: string
  description: string
  [key: string]: unknown
}

const commands: DiscordCommand[] = [
  EDIT_TABLE_COMMAND,
  INVITE_COMMAND,
  CREATE_TABLE_COMMAND,
  DELETE_TABLE_COMMAND,
  GET_TABLE_COMMAND,
  CREATE_JOIN_ORIGIN_COMMAND,
  PLAYER_ENTRY_COMMAND,
  PLAYER_LEAVE_COMMAND,
]

;(async () => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${token}`,
      },
      method: 'PUT',
      body: JSON.stringify(commands),
    })

    if (response.ok) {
      console.log('✅ Comandos registrados com sucesso!')
      await response.json()
    } else {
      console.error('❌ Erro ao registrar comandos:')
      let errorText = `Erro: ${response.url}: ${response.status} ${response.statusText}`
      try {
        const errorBody = await response.text()
        if (errorBody) {
          errorText += `\n\n${errorBody}`
        }
      } catch (err) {
        console.error('Erro ao ler o corpo da resposta:', err)
      }
      console.error(errorText)
    }
  } catch (error) {
    console.error('❌ Falha ao enviar requisição:', error)
  }
})()

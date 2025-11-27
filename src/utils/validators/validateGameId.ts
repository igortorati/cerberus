export function validateGameId(id: string): number | null {
  const gameId = Number(id)
  return isNaN(gameId) ? null : gameId
}

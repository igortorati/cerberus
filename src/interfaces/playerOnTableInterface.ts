export interface PlayerOnTable {
    id: number | undefined;
    gameId: number | undefined;
    isStaffPlayer: boolean;
    discordUserId: string;
    username: string;
    globalName: string;
    nickname: string | null;
}
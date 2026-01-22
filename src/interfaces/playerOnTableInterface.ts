export interface PlayerOnTable {
    id: number;
    gameId: number;
    isStaffPlayer: boolean;
    discordUserId: string;
    username: string;
    globalName: string;
    nickname: string | null;
}
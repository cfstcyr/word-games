export type GameType = 'daily' | 'practice';

export interface GameConfig<GameLevel extends string = 'default'> {
    language: string;
    level: GameLevel;
    type: GameType;
    seed?: string;
}

export interface GameData {
    score: number;
    maxScore: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GamePlay {}

export interface GamePlayResult {
    error?: string;
}

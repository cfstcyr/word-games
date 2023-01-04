import { StartGameConfig } from './game';

export interface StartLetterBoxedConfig extends StartGameConfig {
    found: string[];
}

export interface GameLetterBoxed {
    letters: string[][];
    objective: number;
    played: string[];
    levels: number[];
    maxScore: number;
    score: number;
}

export type GameLetterBoxedPlay = {
    result: { error?: string };
    data: GameLetterBoxed;
};

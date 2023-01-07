import { GameConfig, GameData, GamePlay } from './game';

export type GameLetterBoxedConfig = GameConfig;

export interface GameLetterBoxedData extends GameData {
    played: string[];
    letters: string[][];
    objective: number;
}

export interface GameLetterBoxedPlay extends GamePlay {
    words: string[];
}

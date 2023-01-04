import { GameConfig, GameData, GamePlay } from './game';

export interface GameLetterBoxedConfig extends GameConfig {
    boxSize: number;
    minWordLength: number;
    maxWordCount: number;
}

export interface GameLetterBoxedData extends GameData {
    played: string[];
    letters: string[][];
    objective: number;
}

export interface GameLetterBoxedPlay extends GamePlay {
    words: string[];
}

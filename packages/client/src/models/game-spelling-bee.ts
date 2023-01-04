import { StartGameConfig } from './game';

export interface StartSpellingBeeConfig extends StartGameConfig {
    found: string[];
}

export interface GameSpellingBee {
    letters: string[];
    levels: number[];
    maxScore: number;
    score: number;
    obligatoryLetter: string;
    wordsCount: number;
    found: string[];
}

export type GameSpellingBeeCheck = {
    result: { error?: string };
    data: GameSpellingBee;
};

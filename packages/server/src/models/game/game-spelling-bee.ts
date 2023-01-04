import { GameConfig, GameData, GamePlay } from './game';

export interface GameSpellingBeeConfig extends GameConfig {
    minWordLength: number;
    minWordCount: number;
    letterCount: number;
}

export interface GameSpellingBeeData extends GameData {
    found: string[];
    wordCount: number;
    letters: string[];
    obligatoryLetter: string;
}

export interface GameSpellingBeePlay extends GamePlay {
    word: string;
}

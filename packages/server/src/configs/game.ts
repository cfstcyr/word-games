import { GameLetterBoxed } from '../classes/game-letter-boxed/game-letter-boxed';
import { GameSpellingBee } from '../classes/game-spelling-bee';
import {
    GameLetterBoxedConfig,
    GameLetterBoxedPlay,
} from '../models/game/game-letter-boxed';
import {
    GameSpellingBeeConfig,
    GameSpellingBeePlay,
} from '../models/game/game-spelling-bee';

export interface GameRegistry {
    spellingBee: GameSpellingBee;
    letterBoxed: GameLetterBoxed;
}

export interface GameConfigRegistry {
    spellingBee: GameSpellingBeeConfig;
    letterBoxed: GameLetterBoxedConfig;
}

export interface GamePlayRegistry {
    spellingBee: GameSpellingBeePlay;
    letterBoxed: GameLetterBoxedPlay;
}

export type GameRegistryList = keyof GameRegistry &
    keyof GameConfigRegistry &
    keyof GamePlayRegistry;

export const GAME_LIST: GameRegistryList[] = ['spellingBee'];

export const GAME_CONSTRUCTOR: {
    [K in GameRegistryList]: new (
        config: GameConfigRegistry[K],
    ) => GameRegistry[K];
} = {
    spellingBee: GameSpellingBee,
    letterBoxed: GameLetterBoxed,
};

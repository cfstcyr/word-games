import React from 'react';
import { Game } from '../../models/game';
import {
    GameLetterBoxed,
    GameLetterBoxedPlay,
    StartLetterBoxedConfig,
} from '../../models/game-letter-boxed';
import {
    GameSpellingBee,
    GameSpellingBeeCheck,
    StartSpellingBeeConfig,
} from '../../models/game-spelling-bee';

interface DataContextInterface {
    startGameSpellingBee(
        config?: Partial<StartSpellingBeeConfig>,
    ): Promise<Game<GameSpellingBee>>;
    gameSpellingBeeCheckWord(
        id: string,
        word: string,
    ): Promise<GameSpellingBeeCheck>;

    startGameLetterBoxed(
        config?: Partial<StartLetterBoxedConfig>,
    ): Promise<Game<GameLetterBoxed>>;
    gameLetterBoxedPlay(
        id: string,
        words: string[],
    ): Promise<GameLetterBoxedPlay>;
}

const DataContext = React.createContext<DataContextInterface>(
    {} as DataContextInterface,
);

const useData = () => React.useContext(DataContext);

export { DataContext, useData };

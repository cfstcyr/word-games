import React, { PropsWithChildren, useCallback } from 'react';
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
import { useApi } from '../api-context';
import { DataContext } from './context';

export const DataProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { post } = useApi();

    const startGameSpellingBee = useCallback(
        async (config: Partial<StartSpellingBeeConfig>) => {
            const { isPractice, found }: StartSpellingBeeConfig = {
                isPractice: false,
                found: [],
                ...(config ?? {}),
            };
            return (
                await post<Game<GameSpellingBee>>(
                    `/spelling-bee${isPractice ? '?type=practice' : ''}`,
                    { found },
                )
            ).data;
        },
        [],
    );

    const gameSpellingBeeCheckWord = useCallback(
        async (id: string, word: string) => {
            return (
                await post<GameSpellingBeeCheck>(`/spelling-bee/check/${id}`, {
                    word,
                })
            ).data;
        },
        [],
    );

    const startGameLetterBoxed = useCallback(
        async (config: Partial<StartLetterBoxedConfig>) => {
            const { isPractice, found }: StartLetterBoxedConfig = {
                isPractice: false,
                found: [],
                ...(config ?? {}),
            };
            return (
                await post<Game<GameLetterBoxed>>(
                    `/letter-boxed${isPractice ? '?type=practice' : ''}`,
                    { found },
                )
            ).data;
        },
        [],
    );

    const gameLetterBoxedPlay = useCallback(
        async (id: string, words: string[]) => {
            return (
                await post<GameLetterBoxedPlay>(`/letter-boxed/check/${id}`, {
                    words,
                })
            ).data;
        },
        [],
    );

    return (
        <DataContext.Provider
            value={{
                startGameSpellingBee,
                gameSpellingBeeCheckWord,
                startGameLetterBoxed,
                gameLetterBoxedPlay,
            }}
        >
            {children}
        </DataContext.Provider>
    );
};

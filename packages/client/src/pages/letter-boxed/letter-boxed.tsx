import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './letter-boxed.module.scss';
import { Layout } from '../../components/layout/layout';
import { useData } from '../../contexts';
import { GameLetterBoxed } from '../../models/game-letter-boxed';
import classNames from 'classnames';
import { Button } from '../../components/button/button';
import { GameInput } from '../../components/game-input/game-input';
import { GameLetterBox } from '../../components/game-letter-box/game-letter-box';
import { GameMessage } from '../../components/game-message/game-message';
import { useDelayAction } from '../../hooks/delay-action';

const POSITIONS = [104 / 656, 0.5, 1 - 104 / 656];
const PLAY_DATE = 'letter-boxed-play-date';
const PLAY_FOUND = 'letter-boxed-play-found';

interface Props {
    isPractice?: boolean;
}

export const LetterBoxedGame: React.FC<Props> = ({ isPractice = false }) => {
    const { startGameLetterBoxed, gameLetterBoxedPlay } = useData();
    const [ready, setReady] = useState(false);
    const [id, setId] = useState<string>();
    const [data, setData] = useState<GameLetterBoxed>();
    const [letterIndexes, setLetterIndexes] = useState<{
        [K: string]: { side: number; index: number };
    }>();
    const [inputText, setInputText] = useState<string>('');
    const [error, setError] = useState<string>();
    const [message, setMessage] = useState<string>();
    const [removeError] = useDelayAction(() => setError(undefined));
    const [removeMessage] = useDelayAction(() => setMessage(undefined));
    const canvas = useRef<HTMLCanvasElement>(null);

    const addLetter = useCallback(
        (letter: string) => {
            if (!data) return;
            setInputText((current) => {
                if (current.length === 0 && data.played.length > 0) {
                    const word = data.played[data.played.length - 1];
                    if (letter === word.charAt(word.length - 1))
                        return current + letter;
                } else {
                    if (current.length === 0) {
                        if (data.letters.flat().includes(letter))
                            return current + letter;
                    } else {
                        const index = data.letters.findIndex((side) =>
                            side.includes(current.charAt(current.length - 1)),
                        );

                        if (
                            [
                                ...data.letters.slice(0, index),
                                ...data.letters.slice(index + 1),
                            ]
                                .flat()
                                .includes(letter)
                        )
                            return current + letter;
                    }
                }

                return current;
            });
        },
        [data],
    );

    const deleteLetter = useCallback(
        () =>
            setInputText((current) => {
                if (data && current.length === 1 && data.played.length > 0) {
                    const word = data.played[data.played.length - 1];
                    setData((d) =>
                        d ? { ...d, played: d.played.slice(0, -1) } : d,
                    );
                    return word;
                } else {
                    return current.slice(0, -1);
                }
            }),
        [data],
    );

    const enter = useCallback(() => {
        if (!id) return;
        if (!data) return;
        if (inputText.length === 0) return;

        gameLetterBoxedPlay(id, [...data.played, inputText]).then((result) => {
            if (result.result.error) {
                setError(result.result.error);
                removeError(1000);
            } else {
                setData(result.data);

                if (result.data.played.length > 0) {
                    const word =
                        result.data.played[result.data.played.length - 1];
                    setInputText(word.charAt(word.length - 1));
                } else {
                    setInputText('');
                }

                setMessage('Good!');
                removeMessage(800);
            }
        });
    }, [id, data, inputText]);

    const getLetterPosition = useCallback(
        (letter: string) => {
            if (!letterIndexes) return [0, 0];

            const { side, index } = letterIndexes[letter];

            let x, y;

            switch (side) {
                case 0:
                    x = POSITIONS[index];
                    y = 0;
                    break;
                case 2:
                    x = 1;
                    y = POSITIONS[index];
                    break;
                case 3:
                    x = POSITIONS[index];
                    y = 1;
                    break;
                case 1:
                    x = 0;
                    y = POSITIONS[index];
                    break;
                default:
                    throw new Error('Invalid letter position');
            }

            return [x, y];
        },
        [letterIndexes],
    );

    useEffect(() => {
        if (!isPractice && data) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            localStorage.setItem(PLAY_DATE, today.toISOString());
            localStorage.setItem(PLAY_FOUND, JSON.stringify(data.played));
        }
    }, [data?.played, isPractice]);

    useEffect(() => {
        const onKeyPress = (e: KeyboardEvent) => {
            if (e.key >= 'a' && e.key <= 'z') addLetter(e.key);
            if (e.key === 'Enter') enter();
            if (e.key === 'Backspace') deleteLetter();
        };

        window.addEventListener('keypress', onKeyPress);

        return () => {
            window.removeEventListener('keypress', onKeyPress);
        };
    }, [addLetter, enter, deleteLetter]);

    useEffect(() => {
        let alreadyFound: string[] = [];

        if (!isPractice) {
            const playedDate = localStorage.getItem(PLAY_DATE);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (today.toISOString() === playedDate) {
                alreadyFound =
                    JSON.parse(localStorage.getItem(PLAY_FOUND) ?? '[]') ?? [];
            }
        }

        startGameLetterBoxed({ isPractice, found: alreadyFound })
            .then((res) => {
                setData(res.data);
                setId(res.id);

                if (res.data.played.length > 0) {
                    setInputText(
                        res.data.played[res.data.played.length - 1].slice(-1),
                    );
                }

                const map: { [K: string]: { side: number; index: number } } =
                    {};

                res.data.letters.forEach((side, s) =>
                    side.forEach(
                        (letter, l) => (map[letter] = { side: s, index: l }),
                    ),
                );
                setLetterIndexes(map);
            })
            .finally(() => setReady(true));
    }, [isPractice]);

    const drawLines = useCallback(
        (context: CanvasRenderingContext2D, words: string) => {
            for (let i = 1; i < words.length; ++i) {
                const chars = words
                    .slice(i - 1, i + 1)
                    .split('')
                    .sort();
                const l0 = chars[0];
                const l1 = chars[1];

                const [x0, y0] = getLetterPosition(l0);
                const [x1, y1] = getLetterPosition(l1);

                context.beginPath();
                context.moveTo(
                    x0 * context.canvas.width,
                    y0 * context.canvas.height,
                );
                context.lineTo(
                    x1 * context.canvas.width,
                    y1 * context.canvas.height,
                );
                context.stroke();
            }
        },
        [getLetterPosition],
    );

    useEffect(() => {
        if (!canvas.current) return;
        if (!data) return;

        const context = canvas.current.getContext('2d');

        if (!context) return;

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        const allWords = data.played.join('');

        context.strokeStyle = 'rgb(250, 166, 164)';
        context.lineWidth = 20;

        context.setLineDash([]);
        drawLines(context, allWords);

        context.setLineDash([60, 20]);
        drawLines(context, inputText);
    }, [data, inputText, getLetterPosition]);

    return (
        <Layout
            backLink="/"
            title="Letter Boxed"
            contentClassName={classNames(styles['page'], {
                [styles['page--loading']]: !ready,
            })}
        >
            <GameInput
                content={inputText}
                showCursor={ready}
                showBorderBottom
            />

            <div className={styles['guesses__container']}>
                <p className={styles['guess-count']}>
                    {data && (
                        <>
                            {data.played.length} word
                            {data.played.length > 1 && 's'}
                        </>
                    )}
                </p>
                <div className={styles['guesses']}>
                    {data &&
                        data.played.map((word, i) => (
                            <p key={i} className={styles['guess']}>
                                {word}
                            </p>
                        ))}
                </div>
            </div>

            <div className={styles['goal']}>
                {data && <p>Try to solve in {data.objective} words</p>}
            </div>

            <GameMessage error={error} message={message} />

            <GameLetterBox
                letters={data?.letters}
                used={(data?.played.join('') + inputText).split('')}
                current={inputText.slice(-1)}
                onClick={({ letter }) => addLetter(letter)}
                canvas={canvas}
            />

            <div className={styles['buttons']}>
                <Button ghost onClick={deleteLetter}>
                    Delete
                </Button>
                <Button ghost onClick={enter}>
                    Enter
                </Button>
            </div>
        </Layout>
    );
};

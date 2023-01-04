import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './letter-boxed.module.scss';
import { GameLayout } from '../../components/game-layout/game-layout';
import { useData } from '../../contexts';
import { GameLetterBoxed } from '../../models/game-letter-boxed';
import classNames from 'classnames';
import { Button } from '../../components/button/button';

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
    const errorTimeout = useRef<NodeJS.Timeout>();
    const messageTimeout = useRef<NodeJS.Timeout>();
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

        console.log([...data.played, inputText]);

        gameLetterBoxedPlay(id, [...data.played, inputText]).then((result) => {
            if (result.result.error) {
                setError(result.result.error);

                errorTimeout.current = setTimeout(() => {
                    setError(undefined);
                    clearTimeout(errorTimeout.current);
                    errorTimeout.current = undefined;
                }, 1000);
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

                messageTimeout.current = setTimeout(() => {
                    setMessage(undefined);
                    messageTimeout.current = undefined;
                }, 800);
            }
        });
    }, [id, data, inputText]);

    const getLetterPosition = useCallback(
        (letter: string) => {
            if (!letterIndexes) return [0, 0];

            const { side, index } = letterIndexes[letter];

            const pos = [16 / 90, 0.5, 1 - 16 / 90];

            let x, y;

            switch (side) {
                case 0:
                    x = pos[index];
                    y = 0;
                    break;
                case 2:
                    x = 1;
                    y = pos[index];
                    break;
                case 3:
                    x = pos[index];
                    y = 1;
                    break;
                case 1:
                    x = 0;
                    y = pos[index];
                    break;
                default:
                    throw new Error('Invalid letter position');
            }

            return [x, y];
        },
        [letterIndexes],
    );

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
        startGameLetterBoxed({ isPractice })
            .then((res) => {
                setData(res.data);
                setId(res.id);

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

    useEffect(() => {
        if (!canvas.current) return;
        if (!data) return;

        const context = canvas.current.getContext('2d');

        if (!context) return;

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        const allWords = data.played.join('');
        for (let i = 1; i < allWords.length; ++i) {
            const l0 = allWords.charAt(i - 1);
            const l1 = allWords.charAt(i);

            const [x0, y0] = getLetterPosition(l0);
            const [x1, y1] = getLetterPosition(l1);

            context.strokeStyle = 'rgb(250, 166, 164)';
            context.lineWidth = 4;
            context.setLineDash([]);

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

        for (let i = 1; i < inputText.length; ++i) {
            const chars = inputText
                .slice(i - 1, i + 1)
                .split('')
                .sort();
            const l0 = chars[0];
            const l1 = chars[1];

            const [x0, y0] = getLetterPosition(l0);
            const [x1, y1] = getLetterPosition(l1);

            context.strokeStyle = 'rgb(250, 166, 164)';
            context.lineWidth = 4;
            context.setLineDash([15, 5]);

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
    }, [data, inputText, getLetterPosition]);

    const Letter: React.FC<{ letter: string }> = ({ letter }) => (
        <button
            key={letter}
            className={classNames(styles['box__letter'], {
                [styles['box__letter--used']]:
                    inputText.includes(letter) ||
                    data?.played.some((w) => w.includes(letter)),
                [styles['box__letter--current']]:
                    inputText.charAt(inputText.length - 1) === letter,
            })}
            onClick={() => addLetter(letter)}
        >
            {letter}
        </button>
    );

    return (
        <GameLayout
            backLink="/"
            title="Letter Boxed"
            contentClassName={classNames(styles['page'], {
                [styles['page--loading']]: !ready,
            })}
        >
            <div className={styles['input']}>
                <div className={styles['input__container']}>
                    <div className={styles['input__letters']}>{inputText}</div>
                    <div className={styles['input__cursor']}></div>
                </div>
            </div>

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

            <div className={styles['message__container']}>
                {error && (
                    <div className={styles['message__error']}>{error}</div>
                )}
                {message && !error && (
                    <div className={styles['message__message']}>{message}</div>
                )}
            </div>

            <div className={styles['box__container']}>
                <div
                    className={classNames(
                        styles['box__letters'],
                        styles['box__letters--horizontal'],
                    )}
                >
                    {data?.letters[0].map((letter) => (
                        <Letter key={letter} letter={letter} />
                    ))}
                </div>
                <div className={styles['box__middle']}>
                    <div
                        className={classNames(
                            styles['box__letters'],
                            styles['box__letters--vertical'],
                        )}
                    >
                        {data?.letters[1].map((letter) => (
                            <Letter key={letter} letter={letter} />
                        ))}
                    </div>
                    <div className={styles['box']}>
                        <canvas
                            className={styles['box__canvas']}
                            ref={canvas}
                            height={250}
                            width={250}
                        ></canvas>
                        <div>
                            {data?.letters.map((side, i) => (
                                <div
                                    key={i}
                                    className={styles['box__dots-container']}
                                >
                                    {side.map((letter, j) => (
                                        <div
                                            key={j}
                                            className={classNames(
                                                styles['box__dot'],
                                                {
                                                    [styles['box__dot--used']]:
                                                        inputText.includes(
                                                            letter,
                                                        ) ||
                                                        data?.played.some((w) =>
                                                            w.includes(letter),
                                                        ),
                                                    [styles[
                                                        'box__dot--current'
                                                    ]]:
                                                        inputText.charAt(
                                                            inputText.length -
                                                                1,
                                                        ) === letter,
                                                },
                                            )}
                                        ></div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div
                        className={classNames(
                            styles['box__letters'],
                            styles['box__letters--vertical'],
                        )}
                    >
                        {data?.letters[2].map((letter) => (
                            <Letter key={letter} letter={letter} />
                        ))}
                    </div>
                </div>
                <div
                    className={classNames(
                        styles['box__letters'],
                        styles['box__letters--horizontal'],
                    )}
                >
                    {data?.letters[3].map((letter) => (
                        <Letter key={letter} letter={letter} />
                    ))}
                </div>
            </div>

            <div className={styles['buttons']}>
                <Button ghost onClick={deleteLetter}>
                    Delete
                </Button>
                <Button ghost onClick={enter}>
                    Enter
                </Button>
            </div>
        </GameLayout>
    );
};

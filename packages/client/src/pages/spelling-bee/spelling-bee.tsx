import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './spelling-bee.module.scss';
import { useData, useModal } from '../../contexts';
import { GameSpellingBee } from '../../models/game-spelling-bee';
import classNames from 'classnames';
import { shuffle } from '../../utils/random';
import { Layout } from '../../components/layout/layout';
import { Icon } from '../../components/icon';
import { ProgressBar } from '../../components/progress-bar/progress-bar';
import { COLORS } from '../../constants/colors';
import { Button } from '../../components/button/button';
import { GameMessage } from '../../components/game-message/game-message';
import { GameHoneycomb } from '../../components/game-honeycomb/game-honeycomb';
import { GameInput } from '../../components/game-input/game-input';

const PLAY_DATE = 'spelling-bee-play-date';
const PLAY_FOUND = 'spelling-bee-play-found';

interface Props {
    isPractice?: boolean;
}

export const SpellingBeeGame: React.FC<Props> = ({ isPractice = false }) => {
    const { startGameSpellingBee, gameSpellingBeeCheckWord } = useData();
    const { showModal } = useModal();

    const [ready, setReady] = useState(false);
    const [id, setId] = useState<string>();
    const [data, setData] = useState<GameSpellingBee>();
    const [inputText, setInputText] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [found, setFound] = useState<string[]>([]);
    const [error, setError] = useState<string>();
    const [message, setMessage] = useState<string>();
    const errorTimeout = useRef<NodeJS.Timeout>();
    const messageTimeout = useRef<NodeJS.Timeout>();

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

        startGameSpellingBee({ isPractice, found: alreadyFound }).then(
            ({ id, data }) => {
                setId(id);
                setData(data);
                setFound(data.found.sort());
                setScore(data.score);
                setReady(true);
            },
        );
    }, [isPractice]);

    useEffect(() => {
        if (!isPractice && found.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            localStorage.setItem(PLAY_DATE, today.toISOString());
            localStorage.setItem(PLAY_FOUND, JSON.stringify(found));
        }
    }, [found, isPractice]);

    const deleteLetter = useCallback(() => {
        if (!ready) return;
        setInputText((i) => i.slice(0, -1));
    }, [ready]);

    const addLetter = useCallback(
        (letter: string) => {
            if (!ready) return;
            setInputText((i) => i + letter);
        },
        [ready],
    );

    const enter = useCallback(() => {
        if (!ready) return;
        if (inputText.length === 0) return;
        if (errorTimeout.current) clearTimeout(errorTimeout.current);
        if (messageTimeout.current) clearTimeout(messageTimeout.current);
        setError(undefined);

        if (id)
            gameSpellingBeeCheckWord(id, inputText).then((res) => {
                if (res.result.error) {
                    setError(res.result.error);

                    errorTimeout.current = setTimeout(() => {
                        setError(undefined);
                        setInputText((i) => (i === inputText ? '' : i));
                        errorTimeout.current = undefined;
                    }, 1000);
                } else {
                    setScore(res.data.score);
                    setFound(res.data.found.sort());
                    setInputText('');
                    setMessage('Good!');

                    messageTimeout.current = setTimeout(() => {
                        setMessage(undefined);
                        messageTimeout.current = undefined;
                    }, 800);
                }
            });
    }, [id, inputText, gameSpellingBeeCheckWord]);

    useEffect(() => {
        function onKeyPress(e: KeyboardEvent) {
            if (e.key === 'Backspace') {
                deleteLetter();
            }
            if (e.key === 'Enter') {
                enter();
            }
            if (
                data?.obligatoryLetter === e.key ||
                data?.letters.includes(e.key)
            ) {
                addLetter(e.key);
            }
        }

        window.addEventListener('keypress', onKeyPress);

        return () => {
            window.removeEventListener('keypress', onKeyPress);
        };
    }, [enter, data]);

    const shuffleLetters = useCallback(() => {
        setData((d) => (d ? { ...d, letters: shuffle(d.letters) } : d));
    }, []);

    const showFoundWords = useCallback(() => {
        showModal({
            title:
                found.length === 0
                    ? 'Found words'
                    : `Youd found ${found.length} words`,
            children: (
                <div
                    style={{
                        padding: '12px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 6,
                        textTransform: 'capitalize',
                    }}
                >
                    {found.length > 0 ? (
                        found.map((f) => <span key={f}>{f}</span>)
                    ) : (
                        <span>No words found</span>
                    )}
                </div>
            ),
        });
    }, [found, showModal]);

    return (
        <Layout backLink="/" title="Spelling Bee">
            <div
                className={classNames(styles['game'], {
                    [styles['game--loading']]: !ready,
                })}
            >
                <ProgressBar
                    current={score}
                    max={data?.maxScore}
                    color={COLORS.SPELLING_BEE}
                />

                <div className={styles['found']} onClick={showFoundWords}>
                    <div className={styles['found__words']}>
                        {found.map((f) => (
                            <p key={f}>{f}</p>
                        ))}
                    </div>
                    <Icon icon="angle-down" />
                </div>

                <GameMessage error={error} message={message} />

                <GameInput
                    hasError={error !== undefined}
                    cursorColor={COLORS.SPELLING_BEE}
                    showCursor={ready}
                >
                    {inputText.split('').map((l, i) => (
                        <span
                            key={i}
                            className={classNames({
                                [styles['input__letter--obligatory']]:
                                    l === data?.obligatoryLetter,
                            })}
                        >
                            {l}
                        </span>
                    ))}
                </GameInput>

                <GameHoneycomb
                    letters={data?.letters}
                    center={data?.obligatoryLetter}
                    onClick={addLetter}
                />

                <div className={styles['buttons']}>
                    <Button
                        onClick={deleteLetter}
                        color="gray"
                        size="small"
                        ghost
                    >
                        Delete
                    </Button>
                    <Button
                        onClick={shuffleLetters}
                        color="gray"
                        size="small"
                        ghost
                    >
                        <Icon icon="sync" />
                    </Button>
                    <Button onClick={enter} color="gray" size="small" ghost>
                        Enter
                    </Button>
                </div>
            </div>
        </Layout>
    );
};

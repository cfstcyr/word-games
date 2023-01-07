import classNames from 'classnames';
import React from 'react';
import styles from './game-letter-box.module.scss';

interface Props {
    letters?: string[][];
    used?: string[];
    current?: string;
    canvas?: React.RefObject<HTMLCanvasElement>;
    onClick: (value: { letter: string; side: number; index: number }) => void;
}

export const GameLetterBox: React.FC<Props> = ({
    letters = [
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
    ],
    used = [],
    current = '0',
    canvas,
    onClick,
}) => {
    return (
        <div className={styles['game-letter-box']}>
            <div className={styles['game-letter-box__letters']}>
                {letters.map((side, i) => (
                    <div key={i} className={styles['game-letter-box__side']}>
                        {side.map((letter, j) => (
                            <div
                                key={j}
                                onClick={() =>
                                    onClick({ letter, side: i, index: j })
                                }
                                className={classNames(
                                    styles['game-letter-box__letter'],
                                    {
                                        [styles[
                                            'game-letter-box__letter--current'
                                        ]]:
                                            current.length > 0 &&
                                            letter === current,
                                        [styles[
                                            'game-letter-box__letter--used'
                                        ]]: used.includes(letter),
                                    },
                                )}
                            >
                                <span>{letter}</span>
                                <div
                                    className={classNames(
                                        styles['game-letter-box__dot'],
                                        {
                                            [styles[
                                                'game-letter-box__dot--current'
                                            ]]:
                                                current.length > 0 &&
                                                letter === current,
                                            [styles[
                                                'game-letter-box__dot--used'
                                            ]]: used.includes(letter),
                                        },
                                    )}
                                ></div>
                            </div>
                        ))}
                    </div>
                ))}
                <div className={styles['game-letter-box__box']}>
                    <canvas ref={canvas} height={1000} width={1000}></canvas>
                </div>
            </div>
        </div>
    );
};

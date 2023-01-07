import classNames from 'classnames';
import React from 'react';
import { chunk } from '../../utils/array';
import styles from './game-honeycomb.module.scss';

interface Props {
    letters?: string[];
    center?: string;
    onClick: (letter: string) => void;
}

export const GameHoneycomb: React.FC<Props> = ({
    letters = ['', '', '', '', '', ''],
    center = '',
    onClick,
}) => {
    return (
        <div className={styles['game-honeycomb']}>
            <div
                className={classNames(
                    styles['game-honeycomb__center'],
                    styles['game-honeycomb__letter'],
                )}
                onClick={() => onClick(center)}
            >
                {center}
            </div>
            <div className={styles['game-honeycomb__letters']}>
                {chunk(letters, 2).map((line, i) => (
                    <div
                        key={i}
                        className={classNames(
                            styles['game-honeycomb__letters__line'],
                            styles[`game-honeycomb__letters__line--${i + 1}`],
                        )}
                    >
                        {line.map((letter, i) => (
                            <div
                                key={i}
                                className={styles['game-honeycomb__letter']}
                                onClick={() => onClick(letter)}
                            >
                                {letter}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

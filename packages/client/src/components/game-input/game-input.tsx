import classNames from 'classnames';
import React, { ReactNode } from 'react';
import styles from './game-input.module.scss';

interface Props {
    children?: ReactNode;
    content?: ReactNode;
    showCursor?: boolean;
    cursorColor?: string;
    showBorderBottom?: boolean;
    hasError?: boolean;
}

export const GameInput: React.FC<Props> = ({
    children,
    content,
    showCursor = true,
    cursorColor = 'black',
    showBorderBottom = false,
    hasError = false,
}) => {
    return (
        <div
            className={classNames(styles['game-input'], {
                [styles['game-input--border-bottom']]: showBorderBottom,
                [styles['game-input--error']]: hasError,
            })}
        >
            <div className={styles['game-input__content']}>
                {children ?? content}
            </div>
            <div
                className={classNames(styles['game-input__cursor'], {
                    [styles['game-input__cursor--hide']]: !showCursor,
                })}
                style={{ backgroundColor: cursorColor }}
            ></div>
        </div>
    );
};

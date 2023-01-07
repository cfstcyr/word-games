import classNames from 'classnames';
import React, { ReactNode } from 'react';
import styles from './game-message.module.scss';

interface Props {
    error?: ReactNode;
    message?: ReactNode;
    animateError?: boolean;
    animateMessage?: boolean;
}

export const GameMessage: React.FC<Props> = ({
    error,
    message,
    animateError = true,
    animateMessage = true,
}) => {
    return (
        <div className={styles['game-message']}>
            {error && (
                <div
                    className={classNames(styles['game-message__error'], {
                        [styles['game-message__error--animate']]: animateError,
                    })}
                >
                    {error}
                </div>
            )}
            {message && !error && (
                <div
                    className={classNames(styles['game-message__message'], {
                        [styles['game-message__message--animate']]:
                            animateMessage,
                    })}
                >
                    {message}
                </div>
            )}
        </div>
    );
};

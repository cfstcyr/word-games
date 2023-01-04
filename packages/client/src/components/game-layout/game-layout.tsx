import classNames from 'classnames';
import React, { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../icon';
import styles from './game-layout.module.scss';

interface GameLayoutNavActionProps {
    content: ReactNode;
    to?: string;
    onClick?: () => void;
}

const GameLayoutNavAction: React.FC<GameLayoutNavActionProps> = ({
    content,
    to,
    onClick,
}) => {
    const Wrapper: React.FC<PropsWithChildren> = ({ children }) =>
        to ? <Link to={to}>{children}</Link> : <>{children}</>;

    return (
        <Wrapper>
            <button
                className={styles['game-layout__nav__button']}
                onClick={onClick}
            >
                {content}
            </button>
        </Wrapper>
    );
};

interface Props {
    backLink: string;
    backMessage?: string;
    title?: string;

    buttons?: ComponentProps<typeof GameLayoutNavAction>[];

    contentClassName?: string;
}

export const GameLayout: React.FC<PropsWithChildren<Props>> = ({
    children,
    backLink,
    backMessage,
    title,
    buttons,
    contentClassName,
}) => {
    return (
        <div className={styles['game-layout']}>
            <div className={styles['game-layout__nav']}>
                <div className={styles['game-layout__nav__content']}>
                    <GameLayoutNavAction
                        to={backLink}
                        content={
                            <>
                                <Icon
                                    icon="angle-left"
                                    style={{ marginRight: 6 }}
                                />{' '}
                                {backMessage ?? 'Back'}
                            </>
                        }
                    />

                    <p className={styles['game-layout__nav__title']}>{title}</p>

                    <div className={styles['game-layout__nav__actions']}>
                        {buttons?.map((button, i) => (
                            <GameLayoutNavAction key={i} {...button} />
                        ))}
                    </div>
                </div>
            </div>
            <div
                className={classNames(
                    styles['game-layout__content'],
                    contentClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
};

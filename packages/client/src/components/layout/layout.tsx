import classNames from 'classnames';
import React, { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../icon';
import styles from './layout.module.scss';

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
    backLink?: string;
    backMessage?: string;
    title?: string;
    buttons?: ComponentProps<typeof GameLayoutNavAction>[];
    contentClassName?: string;
    large?: boolean;
}

export const Layout: React.FC<PropsWithChildren<Props>> = ({
    children,
    backLink,
    backMessage,
    title,
    buttons,
    contentClassName,
    large = false,
}) => {
    return (
        <div
            className={classNames(styles['game-layout'], {
                [styles['game-layout--large']]: large,
            })}
        >
            <div className={styles['game-layout__nav']}>
                <div className={styles['game-layout__nav__content']}>
                    <div className={styles['game-layout__nav__buttons']}>
                        {/* {backLink && (
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
                        )} */}
                    </div>

                    <p className={styles['game-layout__nav__title']}>
                        {backLink && (
                            <Link
                                to={backLink}
                                className={styles['game-layout__nav__back']}
                            >
                                <Icon icon="arrow-left" styling="solid" />
                            </Link>
                        )}
                        {title}
                    </p>

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

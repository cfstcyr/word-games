import React, { ReactNode } from 'react';
import styles from './index-page.module.scss';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

interface GameProps {
    className?: string;
    title: ReactNode;
    buttons?: { content: ReactNode; to: string; className?: string }[];
}

const Game: React.FC<GameProps> = ({ className, title, buttons }) => (
    <section className={classNames(styles['index-page__game'], className)}>
        <h2 className={styles['index-page__game__title']}>{title}</h2>
        <div className={styles['index-page__game__actions']}>
            {buttons?.map((button, i) => (
                <Link key={i} to={button.to}>
                    <button
                        className={classNames(
                            styles['index-page__game__button'],
                            button.className,
                        )}
                    >
                        {button.content}
                    </button>
                </Link>
            ))}
        </div>
    </section>
);

export const IndexPage: React.FC = () => {
    return (
        <div className={styles['index-page']}>
            <h1 className={styles['index-page__title']}>Word Games</h1>

            <section className={styles['index-page__games']}>
                <Game
                    title="Spelling Bee"
                    className={styles['index-page__game--spelling-bee']}
                    buttons={[
                        {
                            content: 'Today',
                            to: '/spelling-bee/game',
                            className:
                                styles['index-page__game__button--solid'],
                        },
                        {
                            content: 'Practice',
                            to: '/spelling-bee/practice',
                        },
                    ]}
                />
                <Game
                    title="Letter Boxed"
                    className={styles['index-page__game--letter-boxed']}
                    buttons={[
                        {
                            content: 'Today',
                            to: '/letter-boxed/game',
                            className:
                                styles['index-page__game__button--solid'],
                        },
                        {
                            content: 'Practice',
                            to: '/letter-boxed/practice',
                        },
                    ]}
                />
            </section>
        </div>
    );
};

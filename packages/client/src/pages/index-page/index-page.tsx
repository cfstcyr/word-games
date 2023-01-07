import React from 'react';
import styles from './index-page.module.scss';
import { GameListItem } from '../../components/game-list-item/game-list-item';
import { COLORS } from '../../constants/colors';
import { Layout } from '../../components/layout/layout';

export const IndexPage: React.FC = () => {
    return (
        <Layout
            title="Word Games"
            contentClassName={styles['index-page']}
            large
        >
            <section className={styles['index-page__games']}>
                <GameListItem
                    title="Spelling Bee"
                    className={styles['index-page__game--spelling-bee']}
                    icon="/games/spelling-bee-card-icon.svg"
                    color={COLORS.SPELLING_BEE}
                    buttons={[
                        {
                            children: 'Today',
                            to: '/spelling-bee/game',
                        },
                        {
                            children: 'Practice',
                            to: '/spelling-bee/practice',
                            ghost: true,
                        },
                    ]}
                />
                <GameListItem
                    title="Letter Boxed"
                    className={styles['index-page__game--letter-boxed']}
                    icon="/games/letter-boxed-card-icon.svg"
                    color={COLORS.LETTER_BOXED}
                    buttons={[
                        {
                            children: 'Today',
                            to: '/letter-boxed/game',
                        },
                        {
                            children: 'Practice',
                            to: '/letter-boxed/practice',
                            ghost: true,
                        },
                    ]}
                />
            </section>
        </Layout>
    );
};

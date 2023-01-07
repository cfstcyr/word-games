import React from 'react';
import styles from './progress-bar.module.scss';

interface Props {
    current: number;
    max?: number;
    color?: string;
    showNumber?: boolean;
}

export const ProgressBar: React.FC<Props> = ({
    current,
    max = 1,
    showNumber = false,
    color,
}) => {
    return (
        <div className={styles['progress-bar']}>
            <div className={styles['progress-bar__bar']}>
                <div
                    className={styles['progress-bar__progress']}
                    style={{
                        width: `${(current / max) * 100}%`,
                        backgroundColor: color,
                    }}
                ></div>
            </div>

            {showNumber && (
                <span className={styles['progress-bar__number']}>
                    <span className={styles['progress-bar__number__current']}>
                        {current}
                    </span>
                    <span className={styles['progress-bar__number__separator']}>
                        /
                    </span>
                    <span className={styles['progress-bar__number__max']}>
                        {max}
                    </span>
                </span>
            )}
        </div>
    );
};

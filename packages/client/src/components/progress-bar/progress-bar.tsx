import classNames from 'classnames';
import React from 'react';
import styles from './progress-bar.module.scss';

interface Props {
    current: number;
    max?: number;
    color?: string;
    showNumber?: boolean;
    steps?: number[];
}

export const ProgressBar: React.FC<Props> = ({
    current,
    max = 1,
    showNumber = false,
    color,
    steps,
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
                {steps && (
                    <div className={styles['progress-bar__steps']}>
                        {steps.map((val, i) => (
                            <div
                                key={i}
                                className={classNames(
                                    styles['progress-bar__steps__step'],
                                    {
                                        [styles[
                                            'progress-bar__steps__step--met'
                                        ]]: current >= val,
                                    },
                                )}
                                style={{
                                    left: `${(val * 100) / max}%`,
                                    backgroundColor:
                                        current >= val ? color : undefined,
                                }}
                            ></div>
                        ))}
                    </div>
                )}
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

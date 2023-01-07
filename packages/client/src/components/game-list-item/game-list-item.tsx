import React, { ComponentProps, HTMLProps, ReactNode } from 'react';
import styles from './game-list-item.module.scss';
import { Button } from '../button/button';
import classNames from 'classnames';
import { useScreen } from '../../contexts/screen-context/context';

interface Props extends Omit<HTMLProps<HTMLDivElement>, 'title'> {
    title: ReactNode;
    icon?: string;
    buttons?: ComponentProps<typeof Button>[];
    color?: string;
}

export const GameListItem: React.FC<Props> = ({
    title,
    icon,
    buttons = [],
    color = 'lightgray',
    ...props
}) => {
    const { isSmall } = useScreen();

    return (
        <div
            {...props}
            className={classNames(styles['game-list-item'], props.className)}
        >
            <div
                className={styles['game-list-item__color']}
                style={{ backgroundColor: color }}
            >
                {icon && (
                    <img
                        className={styles['game-list-item__icon']}
                        src={icon}
                    />
                )}
            </div>
            <div className={styles['game-list-item__info']}>
                <span className={styles['game-list-item__title']}>{title}</span>

                <div className={styles['game-list-item__buttons']}>
                    {buttons.map((button, i) => (
                        <Button
                            key={i}
                            {...button}
                            size={button.size ?? isSmall ? 'small' : 'default'}
                            className={classNames(
                                styles['game-list-item__button'],
                                button.className,
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

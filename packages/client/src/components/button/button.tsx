import classNames from 'classnames';
import styles from './button.module.scss';
import React, { ComponentProps, HTMLProps, PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../icon';

interface Props extends Omit<HTMLProps<HTMLButtonElement>, 'size'> {
    icon?: ComponentProps<typeof Icon>;
    ghost?: boolean;
    to?: string;
    size?: 'default' | 'small';
    color?: 'default' | 'gray';
}

export const Button: React.FC<PropsWithChildren<Props>> = ({
    children,
    icon,
    ghost = false,
    to,
    size = 'default',
    color = 'default',
    ...props
}) => {
    const Wrapper: React.FC<PropsWithChildren> = ({
        children: wrapperChildren,
    }) =>
        to ? <Link to={to}>{wrapperChildren}</Link> : <>{wrapperChildren}</>;

    return (
        <Wrapper>
            <button
                {...props}
                type="button"
                className={classNames(
                    styles['button'],
                    styles[`button--size--${size}`],
                    styles[`button--color--${color}`],
                    {
                        [styles['button--ghost']]: ghost,
                    },
                    props.className,
                )}
            >
                {icon && <Icon {...icon} />}
                {children}
            </button>
        </Wrapper>
    );
};

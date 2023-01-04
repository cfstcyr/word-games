import React, { PropsWithChildren, ReactNode } from 'react';
import { Icon } from '../icon';
import styles from './modal.module.scss';

interface Props {
    title?: string;
    onClose?: () => void;
    closeButton?: ReactNode;
}

export const Modal: React.FC<PropsWithChildren<Props>> = ({
    children,
    title,
    onClose,
    closeButton,
}) => {
    return (
        <div className={styles['modal']}>
            <div className={styles['modal__header']}>
                <p className={styles['modal__title']}>{title}</p>
                <span onClick={onClose}>
                    {closeButton ? (
                        closeButton
                    ) : (
                        <button className={styles['modal__close']}>
                            <Icon icon="times" />
                        </button>
                    )}
                </span>
            </div>
            <div className={styles['modal__content']}>{children}</div>
        </div>
    );
};

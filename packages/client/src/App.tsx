import React from 'react';
import styles from './styles/app.module.scss';
import { RouterProvider } from 'react-router-dom';
import { useAlert, useModal } from './contexts';
import { router } from './modules/router';
import classnames from 'classnames';
import { Modal } from './components/modal/modal';

function App() {
    const { alerts } = useAlert();
    const { modals, popModal } = useModal();

    return (
        <>
            <div className={styles['alerts__container']}>
                {alerts.map((a, i) => (
                    <div
                        className={classnames(
                            styles['alerts__item'],
                            styles[`alerts__item--${a.type}`],
                        )}
                        key={i}
                    >
                        {a.message}
                    </div>
                ))}
            </div>
            {modals.length > 0 && (
                <>
                    <div className={styles['modals__container']}>
                        <div
                            className={styles['modals__background']}
                            onClick={popModal}
                        ></div>
                        {modals.map((modal, i) => (
                            <div className={styles['modals__modal']} key={i}>
                                <Modal {...modal} />
                            </div>
                        ))}
                    </div>
                </>
            )}
            <RouterProvider router={router} />
        </>
    );
}

export default App;

import React, { PropsWithChildren } from 'react';
import {
    AlertProvider,
    ApiProvider,
    DataProvider,
    ModalProvider,
} from '../contexts';

export const Provider: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <AlertProvider>
            <ModalProvider>
                <ApiProvider>
                    <DataProvider>{children}</DataProvider>
                </ApiProvider>
            </ModalProvider>
        </AlertProvider>
    );
};

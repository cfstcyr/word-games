import React, { PropsWithChildren } from 'react';
import {
    AlertProvider,
    ApiProvider,
    DataProvider,
    ModalProvider,
} from '../contexts';
import { ScreenProvider } from '../contexts/screen-context/provider';

export const Provider: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <AlertProvider>
            <ScreenProvider>
                <ModalProvider>
                    <ApiProvider>
                        <DataProvider>{children}</DataProvider>
                    </ApiProvider>
                </ModalProvider>
            </ScreenProvider>
        </AlertProvider>
    );
};

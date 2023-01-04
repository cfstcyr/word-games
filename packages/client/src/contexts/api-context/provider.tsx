import React, { PropsWithChildren } from 'react';
import axios, { AxiosError } from 'axios';
import { ApiContext } from './context';
import { env } from '../../utils/environment';
import { useAlert } from '../alert-context';

export const ApiProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { error } = useAlert();
    const instance = axios.create({
        baseURL: env.REACT_APP_SERVER_URL,
    });

    instance.interceptors.response.use(
        undefined,
        (err: AxiosError<{ message: string }>) => {
            error(
                `Cannot ${err.config?.method} ${err.config?.url}: ${err.response?.data.message}`,
            );
            return error;
        },
    );

    return (
        <ApiContext.Provider value={instance}>{children}</ApiContext.Provider>
    );
};

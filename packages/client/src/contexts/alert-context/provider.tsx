import React, { PropsWithChildren, useCallback, useState } from 'react';
import { Alert } from '../../models/alert';
import { AlertContext } from './context';

export const AlertProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const alert = useCallback((alert: Alert) => {
        setAlerts((a) => [...a, alert]);

        setTimeout(() => {
            setAlerts((a) => {
                const index = a.indexOf(alert);
                a.splice(index, 1);
                return [...a];
            });
        }, 2000);
    }, []);

    const error = useCallback((message: string) => {
        alert({ type: 'error', message });
    }, []);

    const warn = useCallback((message: string) => {
        alert({ type: 'warn', message });
    }, []);

    const success = useCallback((message: string) => {
        alert({ type: 'success', message });
    }, []);

    return (
        <AlertContext.Provider value={{ alerts, alert, error, warn, success }}>
            {children}
        </AlertContext.Provider>
    );
};

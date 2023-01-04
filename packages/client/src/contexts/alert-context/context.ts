import React from 'react';
import { Alert } from '../../models/alert';

interface AlertContextInterface {
    alerts: Alert[];

    alert(alert: Alert): void;
    error(message: string): void;
    warn(message: string): void;
    success(message: string): void;
}

const AlertContext = React.createContext<AlertContextInterface>(
    {} as AlertContextInterface,
);

const useAlert = () => React.useContext(AlertContext);

export { AlertContext, useAlert };

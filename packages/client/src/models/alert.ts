export type AlertType = 'error' | 'warn' | 'success';

export interface Alert {
    type: AlertType;
    message: string;
}

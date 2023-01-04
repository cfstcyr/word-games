export interface StartGameConfig {
    isPractice: boolean;
}

export interface Game<T> {
    id: string;
    data: T;
    score: number;
}

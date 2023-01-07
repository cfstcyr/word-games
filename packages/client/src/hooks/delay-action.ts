import { useRef } from 'react';

export function useDelayAction(
    defaultCallback?: () => void,
): [start: (delay: number, callback?: () => void) => void, stop: () => void] {
    const timeout = useRef<NodeJS.Timeout>();

    function stop() {
        clearTimeout(timeout.current);
        timeout.current = undefined;
    }

    function start(delay: number, callback?: () => void) {
        return new Promise<void>((resolve) => {
            stop();
            timeout.current = setTimeout(() => {
                if (callback) callback();
                else defaultCallback?.();
                stop();
                resolve();
            }, delay);
        });
    }

    return [start, stop];
}

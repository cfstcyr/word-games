import { parentPort, workerData } from 'worker_threads';
import { unique } from '../utils/string';

(() => {
    let done = false;

    parentPort?.on('close', () => (done = true));

    const letters: string[] = workerData.letters;
    const words: {
        [K: string]: string[];
    } = workerData.words;
    const stack: string[][] = workerData.stack;
    const maxWordCount: number = workerData.maxWordCount;

    if (!letters) parentPort?.emit('messageerror', 'Must provide letters');
    if (!words) parentPort?.emit('messageerror', 'Must provide words');
    if (!stack) parentPort?.emit('messageerror', 'Must provide stack');
    if (!maxWordCount)
        parentPort?.emit('messageerror', 'Must provide maxWordCount');

    const lettersStr = letters.flat().sort().join('');

    let current: string[] | undefined;

    function isUsingAllLetters(words: string[], requiredLetters: string) {
        return unique(words.join(''), { sort: true }) === requiredLetters;
    }

    function wordIsRedundant(current: string[], next: string) {
        return (
            !current.includes(next) &&
            unique(current.join(''), { sort: true }) === unique(next) &&
            current.slice(-1)[0].slice(-1) === next.slice(-1)
        );
    }

    while ((current = stack.shift()) && current.length > 0) {
        if (isUsingAllLetters(current, lettersStr)) {
            if (!done) {
                parentPort?.postMessage(current);
                parentPort?.close();
            }

            return;
        } else if (current.length < maxWordCount) {
            for (const next of words[current.join('').slice(-1)[0]]) {
                if (!wordIsRedundant(current, next))
                    stack.push([...current, next]);
            }
        }
    }

    if (!done) {
        parentPort?.postMessage([]);
        parentPort?.close();
    }
})();

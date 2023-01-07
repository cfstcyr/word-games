import { RandomSeed } from 'random-seed';

export function* combine<T>(
    array: T[],
    length: number,
    start = 0,
): Generator<T[]> {
    let index = 0;
    if (length < 1) yield [];
    else {
        let i = 0;
        for (const element of array) {
            const subarray = [...array.slice(0, i), ...array.slice(i + 1)];
            for (const combination of combine(subarray, length - 1)) {
                if (index >= start) {
                    yield combination.concat(element);
                }
                index++;
            }
            i++;
        }
    }
}

export function chunk<T>(arr: T[], chunkSize: number): T[][] {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

export function* chunkGenerator<T>(
    gen: Generator<T>,
    chunkSize: number,
): Generator<T[]> {
    let stack: T[] = [];
    for (const item of gen) {
        stack.push(item);

        if (stack.length === chunkSize) {
            yield stack;
            stack = [];
        }
    }
    yield stack;
}

export function* list(start: number, end: number, step = 1) {
    for (let i = start; i < end; i += step) {
        yield i;
    }
}

export function shuffle<T>(array: T[], rand: RandomSeed): T[] {
    let currentIndex = array.length,
        randomIndex;

    while (currentIndex != 0) {
        randomIndex = rand(currentIndex);
        currentIndex--;

        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}

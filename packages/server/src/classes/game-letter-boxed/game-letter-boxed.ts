import { resolve } from 'path';
import { autoInjectable } from 'tsyringe';
import { ALPHABET } from '../../constants/alphabet';
import {
    Dictionary,
    DictionaryNode,
    DictionaryNodeWord,
} from '../dictionary/dictionary';
import { GamePlayResult } from '../../models/game/game';
import {
    GameLetterBoxedConfig,
    GameLetterBoxedData,
    GameLetterBoxedPlay,
} from '../../models/game/game-letter-boxed';
import { DictionaryService } from '../../services/dictionary-service/dictionary-service';
import { WorkerService } from '../../services/worker-service/worker-service';
import { unique } from '../../utils/string';
import { Game } from '../game';

export interface BoxedWord {
    node: DictionaryNodeWord;
    endSide: number;
    endIndex: number;
}

@autoInjectable()
export class GameLetterBoxed extends Game<
    GameLetterBoxedConfig,
    GameLetterBoxedData,
    GameLetterBoxedPlay
> {
    private dictionary: Dictionary;
    private workerService: WorkerService;

    constructor(
        config: GameLetterBoxedConfig,
        dictionayService?: DictionaryService,
        workerService?: WorkerService,
    ) {
        super(config);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.dictionary = dictionayService!.get(config.language);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.workerService = workerService!;
    }

    async initialize(): Promise<void> {
        const letters = this.generateLetters();

        const { objective } = await this.checkLetters(letters);

        this.data = {
            ...this.data,
            letters,
            objective,
        };
    }

    play({ words }: GameLetterBoxedPlay): GamePlayResult {
        for (const word of words) {
            if (word.length < this.config.minWordLength)
                return { error: 'Too short' };
            if (!this.dictionary.exists(word))
                return { error: 'Not in word list' };
        }

        for (let i = 1; i < words.length; ++i) {
            const w0 = words[i - 1];
            const w1 = words[i];

            if (w0.charAt(w0.length - 1) !== w1.charAt(0))
                return { error: 'Must start with last letter' };
        }

        this.data.played = words;

        return {};
    }

    protected defaultData(): GameLetterBoxedData {
        return {
            letters: [],
            maxScore: 0,
            objective: 0,
            played: [],
            score: 0,
        };
    }

    private generateLetters(): string[][] {
        const alphabet = ALPHABET.split('');
        const letters: string[][] = [];

        for (let i = 0; i < 4; ++i) {
            const side: string[] = [];

            for (let j = 0; j < this.config.boxSize; ++j) {
                const index = this.rand(alphabet.length);
                side.push(alphabet[index]);
                alphabet.splice(index, 1);
            }

            letters.push(side);
        }

        return letters;
    }

    private async checkLetters(
        letters: string[][],
    ): Promise<{ objective: number }> {
        const words = this.getWordsList(letters);
        // const lettersStr = letters.flat().sort().join('');

        const stack: string[][] = Object.values(words)
            .flat()
            .sort((a, b) => (a.length > b.length ? -1 : 1))
            .map((w) => [w]);
        // let current: string[] | undefined;

        // let i = 0;
        // while ((current = stack.shift()) && current.length > 0) {
        //     if (this.isUsingAllLetters(current, lettersStr)) {
        //         console.log(i, 'iterations', 'success');
        //         return { objective: current.length };
        //     } else if (current.length < this.config.maxWordCount) {
        //         for (const next of words[current.join('').slice(-1)[0]]) {
        //             if (!this.wordIsRedundant(current, next))
        //                 stack.push([...current, next]);
        //         }
        //     }
        //     i++;
        // }
        // console.log(i, 'iterations', 'error');

        const result = (await this.workerService.first(
            resolve(__dirname, '../../workers/game-letter-boxed-worker.ts'),
            {
                letters,
                words,
                stack,
                maxWordCount: this.config.maxWordCount,
            },
        )) as string[];

        if (result.length > 0) return { objective: result.length };

        throw new Error('Invalid letter combination');
    }

    private wordIsRedundant(current: string[], next: string) {
        return (
            !current.includes(next) &&
            unique(current.join(''), { sort: true }) === unique(next) &&
            current.slice(-1)[0].slice(-1) === next.slice(-1)
        );
    }

    private isUsingAllLetters(words: string[], requiredLetters: string) {
        return unique(words.join(''), { sort: true }) === requiredLetters;
    }

    private getWordsList(letters: string[][]): { [K: string]: string[] } {
        const words: { [K: string]: string[] } = {};
        let noResultCount = 0;

        for (const letter of letters.flat()) {
            const list = this.getWordsListForLetter(letters, letter);

            if (list.length === 0) noResultCount++;

            if (noResultCount > 1)
                throw new Error('Invalid letter combination');

            words[letter] = list;
        }

        return words;
    }

    private getWordsListForLetter(
        letters: string[][],
        letter: string,
    ): string[] {
        const startNode = this.dictionary.getNode(letter);
        if (!startNode) return [];

        const wordsMap: Map<string, string> = new Map();

        const availableMap = this.getAvailableLettersMap(letters);
        const stack: DictionaryNode[] = [startNode];
        let current: DictionaryNode | undefined;

        while ((current = stack.shift())) {
            if (
                current.hasWord() &&
                current.word.length >= this.config.minWordLength
            ) {
                wordsMap.set(
                    unique(current.word.slice(1, -2)) + current.word.slice(-1),
                    current.word,
                );
            }

            for (const letter of availableMap[current.letter]) {
                const next = current.getNode(letter);
                if (next) stack.push(next);
            }
        }

        return [...wordsMap.values()].sort((a, b) =>
            a.length > b.length ? -1 : 1,
        );
    }

    private getAvailableLettersMap(letters: string[][]): {
        [K: string]: string[];
    } {
        const map: { [K: string]: string[] } = {};

        letters.forEach((side, index) => {
            const available = [
                ...letters.slice(0, index),
                ...letters.slice(index + 1),
            ].flat();

            for (const letter of side) {
                map[letter] = available;
            }
        });

        return map;
    }
}

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
import { unique } from '../../utils/string';
import { Game } from '../game';
import { writeFileSync } from 'fs';
import {
    BOX_SIZE,
    MAX_WORD_COUNT,
    MIN_WORD_LENGHT,
} from '../../constants/game-letter-boxed';

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

    constructor(
        config: GameLetterBoxedConfig,
        dictionayService?: DictionaryService,
    ) {
        super(config);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.dictionary = dictionayService!.get(config.language);
    }

    static FromLetters(
        configs: GameLetterBoxedConfig,
        letters: string[][],
        objective: number,
    ) {
        const game = new GameLetterBoxed(configs);

        game.data = {
            ...game.data,
            letters,
            objective,
        };

        return game;
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
            if (word.length < MIN_WORD_LENGHT) return { error: 'Too short' };
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

            for (let j = 0; j < BOX_SIZE; ++j) {
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
        const lettersStr = letters.flat().sort().join('');

        const stack: string[][] = Object.values(words)
            .flat()
            .sort((a, b) => (a.length > b.length ? -1 : 1))
            .map((w) => [w]);
        let current: string[] | undefined;

        writeFileSync('words.txt', stack.join('\n'));

        while ((current = stack.shift()) && current.length > 0) {
            if (this.isUsingAllLetters(current, lettersStr)) {
                return { objective: current.length };
            } else if (current.length < MAX_WORD_COUNT) {
                for (const next of words[current.join('').slice(-1)[0]]) {
                    if (!this.wordIsRedundant(current, next))
                        stack.push([...current, next]);
                }
            }
        }

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

        for (const letter of letters.flat()) {
            words[letter] = this.getWordsListForLetter(letters, letter);
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
            if (current.hasWord() && current.word.length >= MIN_WORD_LENGHT) {
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

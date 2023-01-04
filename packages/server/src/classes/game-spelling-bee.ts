import { autoInjectable } from 'tsyringe';
import { ALPHABET } from '../constants/alphabet';
import {
    Dictionary,
    DictionaryNode,
    DictionaryNodeWord,
} from './dictionary/dictionary';
import { GamePlayResult } from '../models/game/game';
import {
    GameSpellingBeeConfig,
    GameSpellingBeeData,
    GameSpellingBeePlay,
} from '../models/game/game-spelling-bee';
import { DictionaryService } from '../services/dictionary-service/dictionary-service';
import { Game } from './game';

@autoInjectable()
export class GameSpellingBee extends Game<
    GameSpellingBeeConfig,
    GameSpellingBeeData,
    GameSpellingBeePlay
> {
    private dictionary: Dictionary;

    constructor(
        config: GameSpellingBeeConfig,
        dictionayService?: DictionaryService,
    ) {
        super(config);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.dictionary = dictionayService!.get(config.language);
    }

    async initialize(): Promise<void> {
        const { letters, obligatoryLetter } = this.generateLetters();
        const { hasPanagram, wordCount } = this.checkLetters(
            letters,
            obligatoryLetter,
        );

        if (!hasPanagram)
            throw new Error('Letters combinaitions does not has panagram');

        if (wordCount < this.config.minWordCount)
            throw new Error(
                'Lettesr combination does not produce enough words',
            );

        this.data = {
            ...this.data,
            letters,
            obligatoryLetter,
            wordCount,
            maxScore: wordCount,
        };
    }

    play({ word }: GameSpellingBeePlay): GamePlayResult {
        const { minWordLength: minWordLenght } = this.config;
        const { letters, obligatoryLetter } = this.data;

        if (word.length < minWordLenght) return { error: 'Too short' };
        if (
            !word
                .split('')
                .every(
                    (letter) =>
                        obligatoryLetter === letter || letters.includes(letter),
                )
        )
            return { error: 'Invalid letter' };
        if (!word.split('').some((letter) => letter === obligatoryLetter))
            return { error: 'Missing center letter' };

        if (!this.dictionary.exists(word)) return { error: 'Not in word list' };

        if (this.data.found.includes(word)) return { error: 'Already found' };

        this.data.score++;
        this.data.found.push(word);

        return {};
    }

    protected defaultData(): GameSpellingBeeData {
        return {
            score: 0,
            maxScore: 0,
            found: [],
            wordCount: 0,
            letters: [],
            obligatoryLetter: '',
        };
    }

    private generateLetters(): Pick<
        GameSpellingBeeData,
        'letters' | 'obligatoryLetter'
    > {
        const alphabet = ALPHABET.split('');
        const letters: string[] = [];

        for (let i = 0; i < this.config.letterCount - 1; ++i) {
            const index = this.rand(alphabet.length);
            letters.push(alphabet[index]);
            alphabet.splice(index, 1);
        }

        const obligatoryLetter = alphabet[this.rand(alphabet.length)];

        return { letters, obligatoryLetter };
    }

    private checkLetters(
        letters: string[],
        obligatoryLetter: string,
    ): { hasPanagram: boolean; wordCount: number } {
        const allLetters = [...letters, obligatoryLetter];

        const getNodes = (node: DictionaryNode): DictionaryNode[] => {
            return allLetters
                .map((l) => node.getNode(l))
                .filter((n): n is DictionaryNode => n !== undefined);
        };

        let stack: DictionaryNode[] = getNodes(this.dictionary);
        let node: DictionaryNode | undefined;
        let wordCount = 0;
        let hasPanagram = false;

        while ((node = stack.shift())) {
            if (this.isValidNode(node, obligatoryLetter)) {
                wordCount++;
                if (this.isPanagram(node.word, allLetters)) hasPanagram = true;
            }

            stack = stack.concat(getNodes(node));
        }

        return {
            hasPanagram,
            wordCount,
        };
    }

    private isPanagram(word: string, letters: string[]): boolean {
        return letters.every((l) => word.includes(l));
    }

    private isValidNode(
        node: DictionaryNode,
        obligatoryLetter: string,
    ): node is DictionaryNodeWord {
        return (
            node.hasWord() &&
            node.word.length >= this.config.minWordLength &&
            node.word.includes(obligatoryLetter)
        );
    }
}

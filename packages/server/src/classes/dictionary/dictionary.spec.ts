import { Dictionary } from './dictionary';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Dictionary', () => {
    let dictionary: Dictionary;

    beforeEach(() => {
        dictionary = new Dictionary();
    });

    it('should build', () => {
        const words = readFileSync(
            resolve(__dirname, '../../constants/dictionary/test.txt'),
            'utf-8',
        ).split('\n');

        dictionary.build(words);

        expect([...dictionary.nodes.keys()].length).toEqual(4);
    });

    describe('built', () => {
        beforeEach(() => {
            const words = readFileSync(
                resolve(__dirname, '../../constants/dictionary/test.txt'),
                'utf-8',
            ).split('\n');

            dictionary.build(words);
        });

        it('should check if word exists', () => {
            expect(dictionary.exists('abc')).toBeTruthy();
        });

        it('should check if word does not exists', () => {
            expect(dictionary.exists('not a word')).toBeFalsy();
        });

        it('should return words', () => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const node = dictionary.getNode('a')!;
            const words = [...node.getWords()];

            expect(words.length).toEqual(3);
            expect(words.map((n) => n.word)).toEqual(['abc', 'abcd', 'afgh']);
        });
    });
});

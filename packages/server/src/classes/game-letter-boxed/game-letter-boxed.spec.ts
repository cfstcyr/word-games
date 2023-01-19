import { container } from 'tsyringe';
import { DictionaryService } from '../../services/dictionary-service/dictionary-service';
import { GameLetterBoxed } from './game-letter-boxed';

const DICTIONARY_NAME = 'test';
const DICTIONARY = [
    'ab',
    'bc',
    'dc',
    'cd',
    'de',
    'ef',
    'fg',
    'gh',
    'abcd',
    'abcdefgh',
    'da',
];

describe('GameLetterBoxed', () => {
    let game: GameLetterBoxed;

    beforeEach(() => {
        container
            .resolve(DictionaryService)
            .addFromWords(DICTIONARY_NAME, DICTIONARY);

        game = new GameLetterBoxed({
            language: DICTIONARY_NAME,
            level: 'default',
            type: 'practice',
        });
    });

    describe('checkLetters', () => {
        it('should find solution', () => {
            const letters = [
                ['a', 'e'],
                ['b', 'f'],
                ['c', 'g'],
                ['d', 'h'],
            ];

            game['checkLetters'](letters);
        });
    });
});

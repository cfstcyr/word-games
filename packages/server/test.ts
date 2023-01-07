import 'reflect-metadata';
import { resolve } from 'path';
import { container } from 'tsyringe';
import { DictionaryService } from './src/services/dictionary-service/dictionary-service';
import { GameLetterBoxed } from './src/classes/game-letter-boxed/game-letter-boxed';

(async () => {
    const dictionayService = container.resolve(DictionaryService);

    dictionayService.addFromPath(
        'fr',
        resolve(__dirname, './src/constants/dictionary/fr.txt'),
    );

    const letters = [
        ['a', 'b', 'c'],
        ['d', 'e', 'f'],
        ['g', 'h', 'i'],
        ['j', 'k', 'o'],
    ];

    const game = new GameLetterBoxed({
        boxSize: 3,
        language: 'fr',
        level: 'default',
        maxWordCount: 5,
        minWordLength: 3,
        type: 'practice',
        seed: '03012023',
    });

    console.log(await game['checkLetters'](letters));

    // let initialized = false;
    // const start = Date.now();
    // // do {
    // try {
    //     // console.log('new game');
    //     await game.initialize();
    //     initialized = true;
    // } catch (e) {
    //     console.log(e);
    //     game.nextSeed();
    // }
    // // } while (!initialized);

    // const end = Date.now();
    // console.log(
    //     'Done in',
    //     `${Math.round(((end - start) / 1000) * 100) / 100}s`,
    // );
})();

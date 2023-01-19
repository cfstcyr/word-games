import { parse } from 'csv-parse';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { singleton } from 'tsyringe';
import { GameLetterBoxedConfig } from '../../models/game/game-letter-boxed';
import { chunk } from '../../utils/array';

@singleton()
export class CalculatedGameService {
    getLetterBoxedGames({
        language,
    }: GameLetterBoxedConfig): Promise<
        { letters: string[][]; objective: number }[]
    > {
        return new Promise((res, reject) => {
            const path = resolve(
                __dirname,
                `../../../assets/calculated-games/letter-boxed.${language}.txt`,
            );

            if (!existsSync(path))
                return reject(`No calculated game for language "${language}".`);

            const file = readFileSync(path, 'utf-8');

            parse(file, (err, records: [string, string, string][]) => {
                if (err) return reject(err);

                res(
                    records
                        .filter(([, objective]) => Number(objective) > 0)
                        .map(([letters, objective]) => ({
                            letters: chunk(letters.split(','), 3),
                            objective: Number(objective),
                        })),
                );
            });
        });
    }
}

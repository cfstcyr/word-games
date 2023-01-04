import { Router } from 'express';
import { AbstractController } from '../abstract-controller';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { GameService } from '../../services/game-service/game-service';
import {
    LETTER_COUNT,
    MIN_WORD_COUNT,
    MIN_WORD_LENGHT,
} from '../../constants/game-spelling-bee';
import { GameType } from '../../models/game/game';

@singleton()
export class SpellingBeeController extends AbstractController {
    constructor(private readonly gameService: GameService) {
        super('/spelling-bee');
    }

    protected configureRouter(router: Router): void {
        router.post('/', async (req, res) => {
            const language = req.query.language
                ? String(req.query.language)
                : 'fr';
            const found = req.body.found ?? [];
            const gameType = (req.query.type ?? 'daily') as GameType;

            const { game, id } = await this.gameService.start('spellingBee', {
                language,
                letterCount: LETTER_COUNT,
                level: 'default',
                minWordCount: MIN_WORD_COUNT,
                minWordLength: MIN_WORD_LENGHT,
                type: gameType,
            });

            for (const word of found) game.play({ word });

            res.status(StatusCodes.CREATED).json({ data: game.data, id });
        });

        router.post('/check/:id', (req, res) => {
            const { id } = req.params;
            const { word } = req.body;

            const { result, game } = this.gameService.play('spellingBee', id, {
                word,
            });

            res.status(StatusCodes.OK).json({ result, data: game.data });
        });
    }
}

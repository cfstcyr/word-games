import { Router } from 'express';
import { AbstractController } from '../abstract-controller';
import { StatusCodes } from 'http-status-codes';
import { singleton } from 'tsyringe';
import { GameService } from '../../services/game-service/game-service';
import {
    BOX_SIZE,
    MAX_WORD_COUNT,
    MIN_WORD_LENGHT,
} from '../../constants/game-letter-boxed';
import { GameType } from '../../models/game/game';

@singleton()
export class LetterBoxedController extends AbstractController {
    constructor(private readonly gameService: GameService) {
        super('/letter-boxed');
    }

    protected configureRouter(router: Router): void {
        router.post('/', async (req, res, next) => {
            try {
                const language = req.query.language
                    ? String(req.query.language)
                    : 'fr';
                const found = req.body.found ?? [];
                const gameType = (req.query.type ?? 'daily') as GameType;

                const { game, id } = await this.gameService.start(
                    'letterBoxed',
                    {
                        language,
                        level: 'default',
                        type: gameType,
                        boxSize: BOX_SIZE,
                        minWordLength: MIN_WORD_LENGHT,
                        maxWordCount: MAX_WORD_COUNT,
                    },
                );

                game.play({ words: found });

                res.status(StatusCodes.CREATED).json({ data: game.data, id });
            } catch (e) {
                next(e);
            }
        });

        router.post('/check/:id', (req, res, next) => {
            try {
                const { id } = req.params;
                const { words } = req.body;

                const { result, game } = this.gameService.play(
                    'letterBoxed',
                    id,
                    {
                        words,
                    },
                );

                res.status(StatusCodes.OK).json({ result, data: game.data });
            } catch (e) {
                next(e);
            }
        });
    }
}

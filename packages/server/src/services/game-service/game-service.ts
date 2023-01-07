import {
    GameConfigRegistry,
    GamePlayRegistry,
    GameRegistry,
    GameRegistryList,
    GAME_CONSTRUCTOR,
} from '../../configs/game';
import { v4 as uuid } from 'uuid';
import { HttpException } from '../../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import { GameLetterBoxedConfig } from '../../models/game/game-letter-boxed';
import { CalculatedGameService } from '../calculated-game-service/calculated-game-service';
import { singleton } from 'tsyringe';
import { GameType } from '../../models/game/game';
import moment from 'moment';
import { create } from 'random-seed';
import { GameLetterBoxed } from '../../classes/game-letter-boxed/game-letter-boxed';
import { shuffle } from '../../utils/array';

@singleton()
export class GameService {
    private games: { [K in GameRegistryList]: Map<string, GameRegistry[K]> };

    constructor(private readonly calculatedGameService: CalculatedGameService) {
        this.games = {
            spellingBee: new Map(),
            letterBoxed: new Map(),
        };
    }

    async start<K extends GameRegistryList>(
        gameName: K,
        config: GameConfigRegistry[K],
    ) {
        const game = new GAME_CONSTRUCTOR[gameName](config);
        const id = uuid();

        let initialized = false;
        do {
            try {
                await game.initialize();
                initialized = true;
            } catch (e) {
                game.nextSeed();
            }
        } while (!initialized);

        this.games[gameName].set(id, game);

        return { id, game };
    }

    async letterBoxedFromCache(config: GameLetterBoxedConfig) {
        const games = await this.calculatedGameService.getLetterBoxedGames(
            config,
        );
        const random = create(this.getSeed(config.type));

        const { letters, objective } = games[random(games.length)];

        const game = GameLetterBoxed.FromLetters(
            config,
            shuffle(letters, random).map((l) => shuffle(l, random)),
            objective,
        );
        const id = uuid();

        this.games['letterBoxed'].set(id, game);

        return { id, game };
    }

    play<K extends GameRegistryList>(
        gameName: K,
        id: string,
        play: GamePlayRegistry[K],
    ) {
        const game = this.getGame(gameName, id);

        return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result: game.play(play as any),
            game,
        };
    }

    private getGame<K extends GameRegistryList>(
        gameName: K,
        id: string,
    ): GameRegistry[K] {
        const game = this.games[gameName].get(id);

        if (!game)
            throw new HttpException(
                `No ${gameName} game for id "${id}"`,
                StatusCodes.NOT_FOUND,
            );

        return game;
    }

    private getSeed(gameType: GameType): string {
        return gameType === 'daily'
            ? moment().format('DDMMYYYY')
            : `${Math.random()}`;
    }
}

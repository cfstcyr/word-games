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

export class GameService {
    private games: { [K in GameRegistryList]: Map<string, GameRegistry[K]> };

    constructor() {
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
}

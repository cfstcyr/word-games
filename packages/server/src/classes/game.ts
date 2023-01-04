import moment from 'moment';
import { create, RandomSeed } from 'random-seed';
import {
    GameConfig,
    GameData,
    GamePlay,
    GamePlayResult,
} from '../models/game/game';
import { logger } from '../utils/logger';

export abstract class Game<
    Config extends GameConfig = GameConfig,
    Data extends GameData = GameData,
    Play extends GamePlay = GamePlay,
    PlayResult extends GamePlayResult = GamePlayResult,
> {
    protected rand: RandomSeed;
    private seed: string;
    data: Data;
    config: Config;

    constructor(config: Config) {
        this.data = this.defaultData();
        this.config = config;
        this.seed = config.seed ?? this.getSeed();
        this.rand = this.getRandomSeed();

        if (config.seed) logger.debug('Manual seed detected');
    }

    abstract initialize(): Promise<void>;
    abstract play(play: Play): PlayResult;

    protected abstract defaultData(): Data;

    private getSeed(): string {
        return this.config.type === 'daily'
            ? moment().format('DDMMYYYY')
            : `${Math.random()}`;
    }

    nextSeed(): void {
        this.seed = `x${this.seed}`;
        this.rand = this.getRandomSeed();
    }

    private getRandomSeed(): RandomSeed {
        return create(this.seed);
    }
}

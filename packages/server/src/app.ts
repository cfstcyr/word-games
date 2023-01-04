import './configs/registry';
import { injectAll, singleton } from 'tsyringe';
import express from 'express';
import { AbstractController } from './controllers';
import { SYMBOLS } from './constants/symbols';
import { errorHandler } from './middlewares/error-handler';
import { HttpException } from './models/http-exception';
import { StatusCodes } from 'http-status-codes';
import morgan from 'morgan';
import cors from 'cors';
import hpp from 'hpp';
import { env } from './utils/environment';
import { resolve } from 'path';
import { logger } from './utils/logger';
import helmet from 'helmet';
import { DictionaryService } from './services/dictionary-service/dictionary-service';

@singleton()
export class Application {
    private app: express.Application;

    constructor(
        @injectAll(SYMBOLS.controller)
        private readonly controllers: AbstractController[],
        private readonly dictionaryService: DictionaryService,
    ) {
        this.app = express();

        this.configureMiddlewares();
        this.configureRoutes();
        this.configureService();
    }

    listen(port: number | string) {
        this.app.listen(port, () => {
            logger.info(`🏔️ Enviroment : ${env.NODE_ENV}`);
            logger.info(
                `🚀 Server up on port ${port} (http://localhost:${port})`,
            );
        });
    }

    private configureService() {
        this.dictionaryService.addFromPath(
            'fr',
            resolve(__dirname, './constants/dictionary/fr.txt'),
        );
        this.dictionaryService.addFromPath(
            'en',
            resolve(__dirname, './constants/dictionary/en.txt'),
        );
    }

    private configureMiddlewares() {
        this.app.use(
            morgan('dev', {
                skip: function (req, res) {
                    return env.isDev ? false : res.statusCode < 400;
                },
            }),
        );
        this.app.use(express.static(resolve(__dirname, '../public')));
        this.app.use(cors({ origin: env.CORS }));
        this.app.use(hpp());
        this.app.use(helmet());
        this.app.use(express.json());
    }

    private configureRoutes() {
        for (const controller of this.controllers) {
            controller.use(this.app);
        }

        this.app.use('**', (req, res, next) =>
            next(
                new HttpException(
                    `Cannot ${req.method} for ${req.path}`,
                    StatusCodes.NOT_FOUND,
                ),
            ),
        );

        this.app.use(errorHandler);
    }
}

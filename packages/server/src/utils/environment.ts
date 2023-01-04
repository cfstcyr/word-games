import { cleanEnv, num, str } from 'envalid';

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['development', 'test', 'production', 'staging'],
    }),
    PORT: num({ default: 3000 }),

    CORS: str({ default: '*' }),
    LOG_DIR: str({ default: './logs' }),
});

export { env };

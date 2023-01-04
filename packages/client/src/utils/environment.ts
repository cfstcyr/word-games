import { cleanEnv, num, str, url } from 'envalid';

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ['development', 'test', 'production', 'staging'],
    }),
    PORT: num({ default: 3000 }),

    REACT_APP_SERVER_URL: url(),
});

export { env };

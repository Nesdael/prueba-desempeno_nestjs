export const EnvConfig = () => ({
  app: {
    port: Number(process.env.APP_PORT ?? 3000),
    env: process.env.APP_NODE ?? 'development',
  },
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
});

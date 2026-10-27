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
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 3600),
  },
  apiKeys: (process.env.API_KEYS ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean),
});

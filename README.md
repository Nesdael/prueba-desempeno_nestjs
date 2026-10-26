# Project Name

REST API built with NestJS, TypeORM and PostgreSQL.

## Tech Stack

- **Runtime:** Node.js (LTS)
- **Framework:** NestJS
- **Database:** PostgreSQL (Docker)
- **ORM:** TypeORM
- **Auth:** JWT + role-based access control
- **Validation:** class-validator (DTOs) and Zod (environment variables)
- **Docs:** Swagger
- **Testing:** Vitest + Supertest

## Requirements

- Node.js LTS
- npm
- Docker and Docker Compose

## Getting Started

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd <project-folder>
   npm install
   ```

2. Create the `.env` file from the example and fill in the values:

   ```bash
   cp .env.example .env
   ```

3. Start the database:

   ```bash
   docker compose up -d
   ```

4. Run the app in development mode:

   ```bash
   npm run start:dev
   ```

The API runs at `http://localhost:3000/api/v1`.

## Environment Variables

| Variable         | Description                                | Example       |
| ---------------- | ------------------------------------------ | ------------- |
| `NODE_ENV`       | `development`, `test` or `production`      | `development` |
| `PORT`           | Port the app listens on                    | `3000`        |
| `DB_HOST`        | Database host                              | `localhost`   |
| `DB_PORT`        | Database port                              | `5432`        |
| `DB_USER`        | Database user                              | `postgres`    |
| `DB_PASSWORD`    | Database password                          | `postgres`    |
| `DB_NAME`        | Database name                              | `app_db`      |
| `JWT_SECRET`     | Secret used to sign tokens (min. 32 chars) | —             |
| `JWT_EXPIRES_IN` | Token lifetime in seconds                  | `3600`        |

The app validates these variables on startup and will not run if any are missing or invalid.

## Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run start:dev`  | Start in watch mode          |
| `npm run build`      | Compile the project          |
| `npm run start:prod` | Run the compiled build       |
| `npm run lint`       | Lint the code                |
| `npm run test`       | Run unit tests               |
| `npm run test:cov`   | Run unit tests with coverage |
| `npm run test:e2e`   | Run end-to-end tests         |

## API Documentation

Swagger is available at `http://localhost:3000/api/docs`.

To try protected endpoints, log in, copy the token, click **Authorize** and paste it (without the `Bearer` prefix).

## Authentication

All endpoints are protected by default. Send the token in the header:

```
Authorization: Bearer <token>
```

- Routes marked with `@Public()` don't require a token.
- Routes marked with `@Auth(Role.ADMIN)` require a specific role.

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| `401`  | Missing, invalid or expired token        |
| `403`  | Valid token, but the role is not allowed |

## Response Format

Successful responses:

```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found",
  "path": "/api/v1/resource/1",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## Project Structure

```
src/
├── common/
│   ├── decorators/    # @Public, @Roles, @Auth, @CurrentUser
│   ├── enums/         # Role and other enums
│   ├── filters/       # Global exception filter
│   ├── guards/        # JWT and roles guards
│   ├── interceptors/  # Response transform interceptor
│   └── middleware/    # Request logger
├── config/            # App setup, Swagger and env validation
├── modules/
│   ├── auth/          # Register and login
│   └── users/         # Users
├── app.module.ts
└── main.ts
```

## Author

Nestor Duran

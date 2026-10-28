# FleetCore API

REST API to manage the maintenance lifecycle of the FleetCore vehicle fleet: vehicles, mechanics, workshops and preventive or corrective maintenances, with JWT authentication, role-based authorization and an API key for external integrations.

## Coder

|          |                             |
| -------- | --------------------------- |
| **Name** | Nestor Daniel Duran         |
| **Clan** | Centurion Node.js/NestJS PM |

## Tech Stack

- **Framework:** NestJS + TypeScript
- **Database:** PostgreSQL 16
- **ORM:** TypeORM
- **Auth:** JWT (`@nestjs/jwt`) + bcrypt for password hashing
- **Validation:** class-validator (DTOs) and Zod (environment variables)
- **Docs:** Swagger (OpenAPI)
- **Containers:** Docker and Docker Compose

## Requirements

- Node.js 22 or higher
- npm
- Docker and Docker Compose

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/Nesdael/prueba-desempeno_nestjs.git
cd prueba-desempeno_nestjs
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable         | Description                                     | Example                                 |
| ---------------- | ----------------------------------------------- | --------------------------------------- |
| `APP_NODE`       | `development`, `test` or `production`           | `development`                           |
| `APP_PORT`       | Port the API listens on                         | `3000`                                  |
| `DB_HOST`        | Database host                                   | `localhost`                             |
| `DB_PORT`        | Database port exposed by Docker                 | `5433`                                  |
| `DB_USER`        | Database user                                   | `postgres`                              |
| `DB_PASSWORD`    | Database password                               | `postgres`                              |
| `DB_NAME`        | Database name                                   | `prueba_db`                             |
| `JWT_SECRET`     | Secret used to sign tokens (min. 32 characters) | —                                       |
| `JWT_EXPIRES_IN` | Token lifetime in seconds                       | `3600`                                  |
| `API_KEYS`       | Comma-separated keys for external integrations  | `demo-key-partner-1,demo-key-partner-2` |

The app validates these variables with Zod on startup and will not run if any is missing or invalid.

### 3. Run the project

**Option A: API on your machine, database in Docker**

```bash
docker compose up -d postgres
npm run start:dev
npm run seed
```

**Option B: everything in Docker**

```bash
docker compose up -d --build
docker compose exec api node dist/database/seed.js
```

The API runs at `http://localhost:3000/api/v1`.

## Seeder

`npm run seed` populates the database. Running it more than once does not duplicate records: each record is looked up by a unique field (email, plate or name) and only created if it does not exist.

| Data         | Records                                                            |
| ------------ | ------------------------------------------------------------------ |
| Users        | 1 ADMIN and 2 TECHNICIAN                                           |
| Mechanics    | 2 active (linked to the technicians) and 1 inactive                |
| Workshops    | 1 active and 1 inactive                                            |
| Vehicles     | 2 `AVAILABLE`, 1 `IN_MAINTENANCE` and 1 `INACTIVE`                 |
| Maintenances | 1 `IN_PROGRESS` (for the vehicle in maintenance) and 1 `COMPLETED` |

### Test credentials

| Role       | Email                    | Password       |
| ---------- | ------------------------ | -------------- |
| ADMIN      | `admin@fleetcore.com`    | `Admin12345`   |
| TECHNICIAN | `tecnico1@fleetcore.com` | `Tecnico12345` |
| TECHNICIAN | `tecnico2@fleetcore.com` | `Tecnico12345` |

API key for the integration endpoint: `demo-key-partner-1`

## API Documentation (Swagger)

**URL:** http://localhost:3000/api/docs

1. Run `POST /auth/login` with one of the test users and copy the `accessToken`.
2. Click **Authorize** and paste the token in **bearer** (without the `Bearer` prefix).
3. For `GET /vehicles/external`, paste the API key in **x-api-key**.

## Authentication and Authorization

- Every route is protected by default by a global `JwtAuthGuard`. Routes marked with `@Public()` skip it.
- A global `RolesGuard` checks the roles declared with `@Roles()` or `@Auth()`.
- `GET /vehicles/external` is for external integrations: it does not use JWT and requires the `x-api-key` header, validated by `ApiKeyGuard` against `API_KEYS`.

| Case                                    | Response           |
| --------------------------------------- | ------------------ |
| No token, or invalid or expired token   | `401 Unauthorized` |
| Valid token but the role is not allowed | `403 Forbidden`    |
| Missing or wrong API key                | `401 Unauthorized` |

### Custom decorators

| Decorator                           | Purpose                                                      |
| ----------------------------------- | ------------------------------------------------------------ |
| `@Public()`                         | Marks a route as public (no JWT)                             |
| `@Roles(...roles)`                  | Declares the roles allowed on a route                        |
| `@Auth(...roles)`                   | Combines `@Roles()` with the Swagger bearer and 401/403 docs |
| `@CurrentUser(field?)`              | Injects the authenticated user from the JWT                  |
| `@ToLowerCase()` / `@ToUpperCase()` | Normalize emails and plates                                  |

## Endpoints

All routes use the `/api/v1` prefix.

### Auth

| Method | Route            | Access        |
| ------ | ---------------- | ------------- |
| POST   | `/auth/register` | Public        |
| POST   | `/auth/login`    | Public        |
| GET    | `/auth/me`       | Authenticated |

### Vehicles

| Method | Route                                             | Access        |
| ------ | ------------------------------------------------- | ------------- |
| GET    | `/vehicles`                                       | Authenticated |
| GET    | `/vehicles/:term` (id or plate)                   | Authenticated |
| POST   | `/vehicles`                                       | ADMIN         |
| PATCH  | `/vehicles/:id`                                   | ADMIN         |
| DELETE | `/vehicles/:id` (logical delete, sets `INACTIVE`) | ADMIN         |
| GET    | `/vehicles/external`                              | `x-api-key`   |

### Mechanics

| Method | Route                   | Access |
| ------ | ----------------------- | ------ |
| GET    | `/mechanics`            | ADMIN  |
| GET    | `/mechanics/:id`        | ADMIN  |
| POST   | `/mechanics`            | ADMIN  |
| PATCH  | `/mechanics/:id`        | ADMIN  |
| PATCH  | `/mechanics/:id/status` | ADMIN  |

### Workshops

| Method | Route                      | Access        |
| ------ | -------------------------- | ------------- |
| GET    | `/workshops` (active only) | Authenticated |
| GET    | `/workshops/:id`           | Authenticated |
| POST   | `/workshops`               | ADMIN         |
| PATCH  | `/workshops/:id/status`    | ADMIN         |

### Maintenances

| Method | Route                                      | Access                  |
| ------ | ------------------------------------------ | ----------------------- |
| POST   | `/maintenances`                            | ADMIN                   |
| GET    | `/maintenances`                            | ADMIN                   |
| GET    | `/maintenances/active`                     | ADMIN                   |
| GET    | `/maintenances/vehicle/:vehicleId`         | ADMIN                   |
| GET    | `/maintenances/vehicle/:vehicleId/history` | ADMIN                   |
| GET    | `/maintenances/mechanic/:mechanicId`       | ADMIN                   |
| GET    | `/maintenances/me`                         | TECHNICIAN              |
| GET    | `/maintenances/:id`                        | ADMIN, TECHNICIAN (own) |
| PATCH  | `/maintenances/:id/status`                 | ADMIN, TECHNICIAN (own) |

## Business Rules

**When creating a maintenance**

- The vehicle, mechanic and workshop must exist (`404`).
- The vehicle cannot be `INACTIVE`, and the mechanic and workshop must be active (`409`).
- The mileage cannot be lower than the vehicle's current mileage (`400`).
- A vehicle cannot have more than one active maintenance (`SCHEDULED` or `IN_PROGRESS`) (`409`).
- A mechanic cannot have two active maintenances whose schedules overlap, in any workshop (`409`). A maintenance from 7:30 to 9:00 and another starting at 9:00 do not overlap.

**Status transitions**

| From          | Allowed to                 |
| ------------- | -------------------------- |
| `SCHEDULED`   | `IN_PROGRESS`, `CANCELLED` |
| `IN_PROGRESS` | `COMPLETED`, `CANCELLED`   |
| `COMPLETED`   | none (final)               |
| `CANCELLED`   | none (final)               |

Any other transition returns `400` with a descriptive message.

- `IN_PROGRESS`: the vehicle changes to `IN_MAINTENANCE`.
- `COMPLETED`: requires `workPerformed`, `finalCost`, `completedAt` and `finalMileage`. The vehicle returns to `AVAILABLE` and its mileage is updated.
- The maintenance and the vehicle are saved in a single **transaction**: if either fails, nothing is saved.

**Design decision.** The statement says a technician cannot have "more than one active maintenance" at the same time, but also allows several maintenances for the same mechanic as long as their schedules do not overlap. Both rules are applied this way: a mechanic can have several scheduled maintenances without overlapping schedules, but only one `IN_PROGRESS` at a time.

## Response Format

Successful responses (applied by `TransformInterceptor`):

```json
{
  "success": true,
  "statusCode": 200,
  "data": {},
  "timestamp": "2026-10-27T19:00:00.000Z"
}
```

Errors (applied by `AllExceptionFilter`):

```json
{
  "success": false,
  "statusCode": 409,
  "message": "Vehicle ABC123 already has an active maintenance",
  "path": "/api/v1/maintenances",
  "timestamp": "2026-10-27T19:00:00.000Z"
}
```

Validation, authentication, authorization, not-found, business conflict and database uniqueness errors never become a `500`.

## Project Structure

```
src/
├── common/
│   ├── decorators/    # @Public, @Roles, @Auth, @CurrentUser, @ToLowerCase, @ToUpperCase
│   ├── enum/          # Role, vehicle and maintenance enums
│   ├── filters/       # Global exception filter
│   ├── guards/        # JWT, roles and API key guards
│   ├── interceptors/  # Response transform interceptor
│   └── middleware/    # HTTP request logger
├── config/            # App setup, Swagger, database, JWT and env validation
├── database/          # Seeder
├── modules/
│   ├── auth/
│   ├── users/
│   ├── vehicles/
│   ├── mechanics/
│   ├── workshops/
│   └── maintenances/
├── app.module.ts
└── main.ts
```

## Scripts

| Command              | Description            |
| -------------------- | ---------------------- |
| `npm run start:dev`  | Start in watch mode    |
| `npm run build`      | Compile the project    |
| `npm run start:prod` | Run the compiled build |
| `npm run seed`       | Populate the database  |
| `npm run lint`       | Lint the code          |

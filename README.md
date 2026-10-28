# Vomtek API

NestJS + MongoDB backend for the Vomtek website and Studio. Public endpoints
serve the site configuration, catalogue, RFQs, tracker, careers, field notes and
analytics. Protected `/api/admin/*` endpoints power Studio.

## Run

```bash
pnpm install
cp .env.example .env
pnpm start:dev    # http://localhost:4010/api
```

Swagger: http://localhost:4010/api/docs

MongoDB is expected at `mongodb://127.0.0.1:27019/vomtek` by default.

```bash
pnpm build
pnpm start
```

## Seed

`SEED_ON_BOOT=true` creates/updates the owner, settings, catalogue, media,
jobs, field notes and demo project. Editorial source is `data/seed.json`
(override with `SEED_CONTENT_PATH`).

```bash
pnpm seed
```

The demo owner defaults to `admin@vomtek.com` / `VomtekAdmin!2026`. Change both
environment values and the password before deploying.

## Environment

See `.env.example`. Critical production values:

- `MONGODB_URI`
- `JWT_SECRET` — use a 64-character random string
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `CORS_ORIGINS` — public site and Studio origins
- `MAIL_TRANSPORT` / `SALES_NOTIFY_EMAIL`
- `SEED_ON_BOOT=false` once content is managed

## API areas

Auth/users, audit, settings, catalogue, media, quotes, contact, careers,
insights, newsletter, analytics and admin overview.

Auth uses a 15-minute access token and a rotating 7-day HttpOnly refresh cookie.
Roles are enforced by guards: `owner`, `admin`, `sales`, `ops`, `viewer`.

## Verification

```bash
pnpm typecheck
pnpm build
pnpm seed
```

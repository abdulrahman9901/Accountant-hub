# Accountant Hub — Backend API

Laravel 11 API-only application with Sanctum authentication.

## Quick start

From project root (PowerShell):

```powershell
.\scripts\start-dev.ps1
```

Or manually: `docker compose up -d`

| URL | What |
|-----|------|
| http://localhost:8000/api/health | API health check |
| http://localhost:8000/ | Laravel welcome page |
| http://localhost:8000/api | API base path |

First-time DB setup:

```powershell
docker exec accountant_hub_api php artisan migrate:fresh --seed --force
```

## Documentation

- [`docs/database.md`](docs/database.md) — schema, migrations, seeders
- [`docs/api.md`](docs/api.md) — endpoint roadmap and architecture

## Tests

```bash
docker run --rm -v "${PWD}/backend:/app" -w /app php:8.4-cli bash -c "docker-php-ext-install pdo_mysql > /dev/null 2>&1 && php artisan test"
```

Uses SQLite in-memory for tests (`phpunit.xml`).

## Next steps

Implement API endpoints incrementally (auth → categories → jobs → bids) with feature tests per route.

# Accountant Hub — Backend API

Laravel 11 API-only application with Sanctum authentication.

## Quick start

```bash
# From project root
docker compose up -d

# Migrate + seed (PowerShell)
docker run --rm -v "${PWD}/backend:/app" -w /app --add-host=host.docker.internal:host-gateway -e DB_HOST=host.docker.internal php:8.4-cli bash -c "docker-php-ext-install pdo_mysql > /dev/null 2>&1 && php artisan migrate:fresh --seed --force"

# Serve API
docker run --rm -p 8000:8000 -v "${PWD}/backend:/app" -w /app --add-host=host.docker.internal:host-gateway -e DB_HOST=host.docker.internal php:8.4-cli bash -c "docker-php-ext-install pdo_mysql > /dev/null 2>&1 && php artisan serve --host=0.0.0.0"
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

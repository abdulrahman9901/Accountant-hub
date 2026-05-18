# Database — Accountant Hub API

## Stack

- **Engine:** MySQL 8.0 (Docker: `docker compose up -d` from project root)
- **ORM:** Eloquent (Laravel 11)
- **Auth tokens:** `personal_access_tokens` (Sanctum)

## Connection (local)

| Variable       | Value            |
|----------------|------------------|
| `DB_HOST`      | `127.0.0.1`      |
| `DB_PORT`      | `3307`           |
| `DB_DATABASE`  | `accountant_hub` |
| `DB_USERNAME`  | `root`           |
| `DB_PASSWORD`  | `root`           |

## Tables

| Table            | Purpose                          |
|------------------|----------------------------------|
| `users`          | Accountant accounts              |
| `job_categories` | Job filter categories            |
| `jobs`           | Posted accounting jobs           |
| `bids`           | Proposals on jobs                |
| `personal_access_tokens` | Sanctum API tokens     |

See project root [`database-schema.md`](../../database-schema.md) for column definitions and constraints.

## Test connection

From project root (PowerShell):

```powershell
.\scripts\test-db-connection.ps1
```

Or manually:

```bash
# 1. Container ping
docker exec accountant_hub_mysql mysql -uroot -proot -e "SELECT 1"

# 2. Laravel (Docker PHP — use host.docker.internal, not 127.0.0.1)
docker run --rm -v "%cd%/backend:/app" -w /app --add-host=host.docker.internal:host-gateway -e DB_HOST=host.docker.internal php:8.4-cli bash -c "docker-php-ext-install pdo_mysql > /dev/null 2>&1 && php artisan migrate:status"
```

**Local XAMPP PHP:** use `DB_HOST=127.0.0.1` and `DB_PORT=3307` in `backend/.env`. Composer was installed with PHP 8.4 in Docker; run artisan via Docker until platform is aligned with 8.2.

## Commands

```bash
# From project root — start MySQL
docker compose up -d

# Migrations + seed (via Docker PHP 8.4)
docker run --rm -v "%cd%/backend:/app" -w /app --add-host=host.docker.internal:host-gateway php:8.4-cli php artisan migrate:fresh --seed
```

On Windows PowerShell, use `${PWD}/backend` instead of `%cd%/backend`.

## Migrations order

1. `users`, `cache`, `sessions` (Laravel defaults)
2. `personal_access_tokens` (Sanctum)
3. `job_categories`
4. `jobs`
5. `bids`

## Seed data

- **5 categories:** Bookkeeping, Tax Preparation, Payroll, Financial Reporting, Audit Support
- **5 sample jobs:** mix of open/closed statuses across categories

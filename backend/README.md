# Accountant Hub — Backend API

This is the robust, high-performance Laravel 11 API-only backend for the Accountant Hub platform, complete with Sanctum token authentication, performance indexing, and dynamic query caching.

## Quick Start

From the project root directory (using PowerShell or Bash):

1. **Start the backend and database containers:**
   ```bash
   docker-compose up -d --build
   ```

2. **Run first-time DB migrations & seeders:**
   ```bash
   docker exec accountant_hub_api php artisan migrate:fresh --seed --force
   ```

### Important Service Endpoints (Local)

| Service URL | Description |
|-------------|-------------|
| `http://localhost:8000/` | Laravel default welcome page |
| `http://localhost:8000/api` | Base API path |
| `http://localhost:8000/api/health` | API health check endpoint |

---

## Performance Enhancements Implemented

The API response time has been optimized to sub-100ms through:
1. **Persistent Connections:** `DB_PERSISTENT=true` enabled in the environment.
2. **Database Indexing:** Created composite/single indexes for job categories, budgets, posted status, and a full-text search index on job titles and descriptions.
3. **Advanced Caching:**
   - Categories cached for 1 hour.
   - Dynamic job listings (keyed by filters and pagination) cached for 30 seconds.
   - Smart cache invalidation triggered automatically inside `BidController` upon new bid submissions.

---

## Testing the Backend

You can execute the automated test suite directly on the running container:

```bash
docker exec accountant_hub_api php artisan test
```

*Note: Tests run using an in-memory SQLite configuration (`phpunit.xml`) to keep tests completely isolated and ultra-fast.*

## Documentation

- [`docs/database.md`](../docs/database.md) — schema structure, migrations, and seeders
- [`docs/api.md`](../docs/api.md) — API endpoint paths, authentication details, and payloads

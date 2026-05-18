# API — Accountant Hub

Base URL: `http://localhost:8000/api`

## Status

| Endpoint | Method | Auth | Status |
|----------|--------|------|--------|
| `/health` | GET | No | Done |
| `/register` | POST | No | Planned |
| `/login` | POST | No | Planned |
| `/logout` | POST | Bearer | Planned |
| `/user` | GET | Bearer | Planned |
| `/categories` | GET | No | Planned |
| `/jobs` | GET | No | Planned |
| `/jobs/{id}` | GET | No | Planned |
| `/jobs/{id}/bids` | POST | Bearer | Planned |
| `/user/bids` | GET | Bearer | Planned |

## Architecture

- Thin controllers → **Actions** (business logic) → Eloquent models
- Validation: **FormRequest** classes
- Responses: **API Resources**
- Auth: **Laravel Sanctum** (Bearer tokens)

Implementation proceeds endpoint-by-endpoint with PHPUnit feature tests per route.

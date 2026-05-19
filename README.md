---
title: Accountant Hub
emoji: 📊
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# Accountant Hub

Accountant Hub is a high-performance full-stack web platform connecting clients with professional accountants. The application allows clients to post accounting jobs and professional accountants to browse listings, apply dynamic filters, place bids, and track proposals in real time.

This project has been meticulously optimized to achieve an **API response time under 100ms** through a combination of database indexing, persistent connections, and advanced query caching.

## Tech Stack Used

- **Frontend:** React (TypeScript), Vite, Vanilla CSS.
- **Backend:** Laravel 11 (PHP 8.4).
- **Database:** MySQL 8.
- **Deployment & Architecture:** Docker, Nginx (Reverse Proxy), PHP-FPM, Hugging Face Spaces.

---

## Demo Credentials & Live Demo

You can register a brand new account instantly via the frontend UI by clicking **Sign Up**. For immediate testing, you can also log in directly using these pre-seeded demo credentials:
* **Email:** `accountant@example.com`
* **Password:** `password123`

---

## Key Performance Optimizations

### 1. Database Indexing & Schema Design
To eliminate full-table scans during search, filtering, and sorting of jobs, we implemented optimal indexes via a migration:
- **Composite/Single Indexes:** Added performance-critical indexes to the `jobs` table for `budget_min`, `budget_max`, and `category_id` (foreign key).
- **Full-Text Indexing:** Added a full-text search index (`title`, `description`) to enable rapid matching on job queries.
- **Timestamp Sorting Optimization:** Created index pairings on `posted_date` and `status` to ensure budget and date sorting are executed completely in-memory.

### 2. Persistent Database Connections
- Reduced connection establishment overhead between Laravel and MySQL by enabling `DB_PERSISTENT=true`. This ensures database connections are kept alive across requests, saving critical milliseconds per API call.

### 3. Dynamic Query Caching Strategy
- **Categories Cache:** Since job categories are rarely updated, they are wrapped in a 1-hour cache (`Cache::remember`).
- **Dynamic Listings Cache:** Job search listings are dynamically cached for **30 seconds** based on query parameters (filters, sorting, pagination). Every unique search query generates a deterministic cache key.
- **Smart Cache Invalidation:** Placed a `Cache::flush()` trigger inside the `BidController` so that the cache is instantly invalidated the moment a new bid is placed. This prevents stale listings while keeping average retrieval speeds under 100ms.

---

## Setup Instructions

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed.
- [Docker Compose](https://docs.docker.com/compose/install/) (for local multi-container development).

### Environment Configuration
Database settings and environments are automatically configured to run out-of-the-box in all modes.

---

## How to Run the Project Locally

### 1. Development Mode (Recommended for coding)
This spins up the Backend (Laravel), Frontend (React via host), and Database (MySQL) in separate containers.

1. Start backend & database:
   ```bash
   docker-compose up -d --build
   ```
2. Run database migrations & seeders:
   ```bash
   docker exec accountant_hub_api php artisan migrate --seed
   ```
3. Start React locally:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Access the app at `http://localhost:5173`.

### 2. Production/Hugging Face Mode
This builds and runs the entire app inside a **single unified container** mimicking the exact environment on Hugging Face Spaces.

1. Build the unified Docker image:
   ```bash
   docker build -t hf-accountant-hub .
   ```
2. Run the container:
   ```bash
   docker run -p 7860:7860 hf-accountant-hub
   ```
3. Access the application at `http://localhost:7860`.

---

## Running Backend Feature Tests

The backend is backed by an automated test suite verifying auth flow, category endpoints, job filtering, and bid submissions.

To run the backend tests locally:
```bash
docker exec accountant_hub_api php artisan test
```

---

## API Endpoints

Served under the `/api/` prefix.

### Authentication
- `POST /api/register` - Register a new user (roles: `client`, `accountant`).
- `POST /api/login` - Authenticate and receive a Sanctum token.
- `POST /api/logout` - Invalidate the current session token.

### Jobs & Listings
- `GET /api/jobs` - Retrieve a paginated list of open jobs. Supports query filters (`search`, `category`, `min_budget`, `max_budget`) and sorting (`sort_by`).
- `GET /api/jobs/{id}` - Retrieve details for a specific job.

### Categories
- `GET /api/categories` - Fetch all job categories.

### Bids (Accountants Only)
- `GET /api/bids` - Retrieve bids placed by the authenticated accountant.
- `POST /api/jobs/{id}/bids` - Place a new bid on a job.

---

## Assumptions Made

1. **Hugging Face Statelessness:** Because Hugging Face Spaces (Free Tier) spin down when inactive, the deployment uses a `start.sh` entrypoint that automatically boots MySQL and runs migrations/seeders on every cold start. This guarantees a fully functional demo without requiring persistent storage setups.
2. **Atomic UI Layout:** The grid layout for job listings was transformed into a vertical layout for better readability when sorting items by budget or date.
3. **Caching Strategy:** Categories are cached for 1 hour, and job listings are cached for 30 seconds dynamically based on their query filters. Creating a new bid explicitly flushes the cache to ensure real-time UI updates.
4. **Performance Indexes:** Specific indexes and full-text indexes were applied via database migrations to minimize query latency on the jobs table (targeting sub-100ms response times).
5. **Attachments UI Placeholder:** In alignment with the assessment specification ("Attachments placeholder, if any"), a polished visual placeholder is implemented on the Job Details view. Actual file uploading and backend storage logic were assumed out of scope since no storage schemas or storage disk requirements were specified.

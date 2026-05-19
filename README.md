---
title: Accountant Hub
emoji: 📊
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# Accountant Hub

Accountant Hub is a full-stack web application designed to connect clients with professional accountants. It allows clients to post accounting jobs and accountants to browse those jobs, submit bids, and track their proposals.

## Tech Stack Used

- **Frontend:** React (TypeScript), Vite, Vanilla CSS.
- **Backend:** Laravel 11 (PHP 8.4).
- **Database:** MySQL.
- **Deployment & Architecture:** Docker, Nginx, PHP-FPM, Hugging Face Spaces.

## Setup Instructions

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) installed (for local multi-container development).

### Environment Configuration
The project is configured to work out-of-the-box using the provided Docker environments. For the unified Hugging Face deployment, database settings are automatically injected.

## How to Run the Project Locally

There are two ways to run the project locally: **Development Mode** (using `docker-compose`) and **Production/Hugging Face Mode** (using the unified `Dockerfile`).

### 1. Development Mode (Recommended for coding)
This method spins up the Backend (Laravel), Frontend (React via your host machine), and Database (MySQL) individually.

1. Start the backend and database:
   ```bash
   docker-compose up -d --build
   ```
2. Run database migrations and seeders:
   ```bash
   docker exec accountant_hub_api php artisan migrate --seed
   ```
3. Start the React frontend locally:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Access the app at `http://localhost:5173`.

### 2. Hugging Face Deployment Mode
This method mimics the exact production environment used on Hugging Face Spaces (a single container running Nginx, PHP-FPM, and MySQL).

1. Build the unified Docker image:
   ```bash
   docker build -t hf-accountant-hub .
   ```
2. Run the container, exposing the required port `7860`:
   ```bash
   docker run -p 7860:7860 hf-accountant-hub
   ```
3. Access the application at `http://localhost:7860`.

## API Endpoints

The API is served under the `/api/` prefix.

### Authentication
- `POST /api/register` - Register a new user (role: `client` or `accountant`).
- `POST /api/login` - Authenticate and receive a Sanctum token.
- `POST /api/logout` - Invalidate the current session token.

### Jobs
- `GET /api/jobs` - Retrieve a paginated list of open jobs. Supports filtering (`search`, `category`, `min_budget`, `max_budget`) and sorting (`sort_by`).
- `GET /api/jobs/{id}` - Retrieve details for a specific job.

### Categories
- `GET /api/categories` - Fetch all available job categories.

### Bids (Accountants Only)
- `GET /api/bids` - Retrieve all bids submitted by the authenticated accountant.
- `POST /api/jobs/{id}/bids` - Submit a new bid for a specific job.

## Assumptions Made

1. **Hugging Face Statelessness:** Because Hugging Face Spaces (Free Tier) spin down when inactive, the deployment uses a `start.sh` entrypoint that automatically boots MySQL and runs migrations/seeders *on every cold start*. This guarantees a fully functional demo without requiring persistent storage setups.
2. **Atomic UI Layout:** The grid layout for job listings was transformed into a vertical layout for better readability when sorting items by budget or date.
3. **Caching Strategy:** Categories are cached for 1 hour, and job listings are cached for 30 seconds dynamically based on their query filters. Creating a new bid explicitly flushes the cache to ensure real-time UI updates.
4. **Performance Indexes:** Specific indexes and full-text indexes were applied via database migrations to minimize query latency on the `jobs` table (targeting sub-100ms response times).

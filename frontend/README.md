# Accountant Hub — Frontend

This is the React frontend for the Accountant Hub application, built with Vite, TypeScript, and Vanilla CSS.

## Features

- **Modern & Premium UI:** Designed using custom dark/light color palettes, smooth hover micro-animations, and clean cards.
- **Dynamic Job Board:** Displays jobs in a streamlined single-column vertical list layout for optimal readability.
- **Advanced Filtering & Sorting:** Allows real-time filtering by category, search queries, and budget ranges, with instant sorting.
- **Bid Management:** Secure portal for accountants to submit, track, and monitor bids on open jobs.
- **Seamless Authentication:** Client and Accountant registration/login utilizing Laravel Sanctum token-based sessions.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Vanilla CSS (no bloated frameworks, highly optimized for performance)
- **API Client:** Axios-based normalized client (`src/api/client.ts`)

## Local Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env` file in this directory (or use `.env.example` as a template):
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Production Build:**
   To bundle the static assets for production deployment (e.g., serving via Nginx or Laravel's public path):
   ```bash
   npm run build
   ```

# ZAYRO Premium E-commerce & AI Fashion Platform

ZAYRO is a full-stack, E2E premium fashion platform featuring a modern Next.js client frontend and a robust Node.js Express backend. It incorporates Stripe checkout payment processing, coupon management, and an AI Fashion Assistant powered by Gemini and Ollama.

---

## Architecture Overview

The repository is structured as a clean monorepo utilizing **npm workspaces**:

- **[`frontend/`](file:///c:/Journey%20can%20begain/E-commerce/frontend)**: Next.js application handling the client user interface, cart/bag management, interactive AI chatbot UI, stripe redirection, and responsive styling.
- **[`backend/`](file:///c:/Journey%20can%20begain/E-commerce/backend)**: Express server serving REST endpoints, database integration, admin analytics, AI chatbot reasoning (via Gemini API and Ollama local host), and payment processing APIs.
- **[`api/`](file:///c:/Journey%20can%20begain/E-commerce/api)**: Vercel serverless gateway mapping `/api/*` routes directly into the Express backend.

---

## Core Features

1. **AI Fashion Assistant (ZAYRO AI)**:
   - Integrates Gemini API (`gemini-3.6-flash`) and local Ollama server models (`qwen2.5:3b`).
   - Filters off-topic inputs (e.g. coding, math, politics) using few-shot classification guardrails.
   - Injecting real-time store inventory (price, Stock level, category) directly into prompt context.
2. **Coupons & Discount Logic**:
   - Create, update, toggle active states, and track coupon usages.
   - Automatically checks expiry, usage limits, and minimum order values (`min_order_amount`).
3. **Stripe Payment Gateway**:
   - Secure server-side Stripe Checkout session generation.
   - Auto-updating inventory stock on successful checkout events.
4. **Admin Dashboard**:
   - Detailed revenue charts, sales metrics, and top products sold visualizations using Recharts.
   - Complete customer list views and order tracking updates.

---

## Environment Variables

Create a `.env` file inside both `/frontend` and `/backend` (or at the root folder for workspace utilities) based on the [`.env.example`](file:///c:/Journey%20can%20begain/E-commerce/.env.example) template:

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for signing and verifying user authorization tokens. |
| `STRIPE_SECRET_KEY` | Private test key for Stripe payment session requests. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public client key to load Stripe library scripts. |
| `NEXT_PUBLIC_URL` | Base API target url for Axios queries (usually `http://localhost:5000/api`). |
| `GEMINI_API_KEY` | Key for Google Gemini API. |
| `GEMINI_MODEL` | Target Gemini model (e.g., `gemini-3.6-flash`). |
| `OLLAMA_HOST` | Host URL for local Ollama server. |
| `OLLAMA_MODEL` | Target Ollama model name (e.g., `qwen2.5:3b`). |
| `DB_HOST` | Hostname of the MySQL database. |
| `DB_USER` | MySQL database username. |
| `DB_NAME` | MySQL database name. |

---

## Setup & Running Locally

### 1. Database Setup
1. Create a MySQL database named `ecommerce`.
2. Import the provided schema and backup data from [`database_backup.sql`](file:///c:/Journey%20can%20begain/E-commerce/database_backup.sql):
   ```bash
   mysql -u root -p ecommerce < database_backup.sql
   ```

### 2. Workspace Installation
Install all dependencies for both the frontend and backend in one command from the project root:
```bash
npm install
```

### 3. Run in Development Mode
Launch both the Express backend API and Next.js frontend concurrently:
```bash
npm run dev
```
- Frontend will serve on: `http://localhost:3000`
- Express API will serve on: `http://localhost:5000`

---

## Production Build & Deployment

### 1. Frontend Build Verification
Verify Next.js frontend builds without errors:
```bash
npm run build
```

### 2. Deployment on Vercel
Vercel automatically builds the project using the root [`vercel.json`](file:///c:/Journey%20can%20begain/E-commerce/vercel.json) configuration:
- Next.js builds the static and dynamic React client pages.
- Serverless Node.js endpoints inside `/api` route requests to `/backend/index.js` Express router.

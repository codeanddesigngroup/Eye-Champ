# Eye Champ

Eye Champ uses Next.js for the storefront/admin UI and a separate Express REST API backed by PostgreSQL.

## Local setup

1. Create a PostgreSQL database named `eye_champ`.
2. Copy `.env.example` to `.env` and update `DATABASE_URL` and the initial admin credentials.
3. Install dependencies with `npm install`.
4. Run both applications with `npm run dev`.

The frontend runs at `http://localhost:3000` and Express runs at `http://localhost:4000`. The database schema is created automatically when Express starts. The admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` is inserted only when that email does not already exist.

## REST API

- `GET /api/health` — PostgreSQL health check
- `POST /api/admin/login` — authenticate and create a database session
- `GET /api/admin/session` — return the signed-in administrator
- `POST /api/admin/logout` — revoke the current session
- `GET /api/admin/categories` — list categories
- `POST /api/admin/categories` — create a category
- `PATCH /api/admin/categories/:id` — update a category
- `PATCH /api/admin/categories` — bulk-update category status
- `DELETE /api/admin/categories` — bulk-delete categories
- `GET /api/admin/collections` — list collections
- `POST /api/admin/collections` — create a collection
- `PATCH /api/admin/collections/:id` — update a collection
- `PATCH /api/admin/collections` — bulk-update collection status
- `DELETE /api/admin/collections` — bulk-delete collections
- `GET /api/admin/brands` — list brands
- `POST /api/admin/brands` — create a brand
- `PATCH /api/admin/brands/:id` — update a brand
- `PATCH /api/admin/brands` — bulk-update brands
- `DELETE /api/admin/brands` — bulk-delete brands
- `GET /api/admin/products` — list products
- `GET /api/admin/products/:id` — get a product
- `POST /api/admin/products` — create a product
- `POST /api/admin/uploads/products` — upload product images

The frontend proxies `/api/*` to Express, allowing the authentication cookie to remain HTTP-only and same-origin.

## Scripts

- `npm run dev` — Next.js and Express in watch mode
- `npm run dev:frontend` — Next.js only
- `npm run dev:backend` — Express only
- `npm run build` — production frontend build
- `npm start` — start the production frontend and backend

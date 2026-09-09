# EduSolo General API

REST API for EduSolo - educational tourism platform for Solo Raya. Handles destinations, admin CRUD, AI recommendations, and chatbot proxy.

**Live API:** https://edusolo-general-api.vercel.app/api/v1 - **Frontend:** https://github.com/IL-BengawanSolo/edusolo-fe — **Live Demo:** https://edusolo.vercel.app — **Health:** `GET /health`

![Node](https://img.shields.io/badge/Node-20-339933?logo=node.js) ![Express](https://img.shields.io/badge/Express-4-black?logo=express) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql) ![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel)

## Features

- **Destinations** — Search with filters (`search`, `region`, `category`, `price`, `age`, `open days`, `sort` by price/rating/name/newest) and pagination. Detail by `slug`, similar destinations, and admin lookup by `uuid`.
- **Admin CRUD** — Create, update, delete destinations with auto `uuid`/`slug` and `zod` validation. `admin` is view-only, `super_admin` has full write access.
- **Images** — Upload single/bulk (`jpeg/png/webp`, 5MB), list, delete, and set primary. Stored locally (`uploads/images`) or `/tmp` on Vercel (ephemeral).
- **Auth** — Register, login, and profile (`/auth/me`) with JWT Bearer, `bcrypt`, and `role` (`user`/`admin`/`super_admin`).
- **Recommendations** — User sessions, questions, AI proxy (Hugging Face, 10s timeout), and results with IDOR protection.
- **Chatbot** — Groq proxy (`llama-3.3-70b`) with rate limiting and prompt sanitization.

## Tech Stack

| Layer | Technologies |
|---|---|
| **Runtime** | Node 20, Express 4, ES Modules |
| **Database** | TiDB Cloud (MySQL compatible) / MySQL 8, `mysql2/promise` (pool, `utf8mb4`, `DATABASE_URL` for TiDB), `Dump20250709.sql` + `migrate_add_role.js` |
| **Auth** | `passport` (local + JWT), `jsonwebtoken`, `bcryptjs` |
| **Validation** | `zod` |
| **Upload** | `multer` |
| **Security** | `helmet`, `cors` (allowlist), `express-rate-limit` |
| **Deployment** | Vercel (`vercel.json`) |

## Getting Started

**Prerequisites:** Node 20+, MySQL 8, npm 9+

```bash
git clone https://github.com/IL-BengawanSolo/edusolo-general-api.git
cd edusolo-general-api
npm install
cp .env.example .env.development.local
# Edit .env.development.local
npm run dev   # http://localhost:5500
```

**Env files:**
- `npm run dev` → loads `.env.development.local` (gitignored)
- Vercel → uses Dashboard Env (do not commit `.env.production.local`)
- Only 2 files: `.env.example` (template) + `.env.development.local` (real)

**.env.example**

```
PORT=5500
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=edusolo
JWT_SECRET=change-me-32chars
JWT_EXPIRES_IN=1d
GROQ_API_KEY=gsk_your_key
ALLOWED_ORIGINS=http://localhost:5173,https://edusolo.vercel.app
BASE_URL=http://localhost:5500
ADMIN_EMAIL=admin@edusolo.local
ADMIN_INITIAL_PASSWORD=change-me-12chars-min
```

**Setup DB (TiDB Cloud / MySQL — gunakan dump lengkap):**

```bash
# TiDB Cloud: buat cluster di tidbcloud.com → Connect → mysql://... → set DATABASE_URL di .env.development.local
# Atau lokal MySQL:
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS edusolo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p edusolo < database/Dump20250709.sql
# Jika pakai TiDB Cloud:
# mysql --host=gateway01.us-west-2.prod.aws.tidbcloud.com --port=4000 -u <user> -p edusolo < database/Dump20250709.sql

# Tambah role + seed admin (set password via env, tidak hardcode)
ADMIN_EMAIL=admin@edusolo.local ADMIN_INITIAL_PASSWORD=your_secure_password node database/migrate_add_role.js
```

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No | Default `5500` |
| `MYSQL_HOST/PORT/USER/PASSWORD/DATABASE` | Yes (if no `DATABASE_URL`) | Local MySQL |
| `DATABASE_URL` | Yes (TiDB Cloud, alternative) | `mysql://user:pass@gateway01...:4000/edusolo?sslMode=VERIFY_IDENTITY` |
| `JWT_SECRET` | Yes | `crypto.randomBytes(32).toString('base64')` |
| `JWT_EXPIRES_IN` | No | Default `1d` |
| `GROQ_API_KEY` | For chatbot | `gsk_...` |
| `ALLOWED_ORIGINS` | No | Default `localhost:5173,3000` + vercel FE |
| `BASE_URL` | No | For absolute `image_url` |
| `ADMIN_EMAIL` | For seed | `admin@edusolo.local` |
| `ADMIN_INITIAL_PASSWORD` | For seed (sensitive) | Set in `.env.development.local` (local) / Vercel Env (prod), never committed |

## Project Structure

```
app.js                # Express app, middleware, routes, error handler
config/               # env, passport strategies
routes/               # auth, destinations, recommendations, chatbot
controllers/          # Request handlers
services/             # Business logic
repository/           # DB queries
middlewares/          # validate, validateUuid, requireAdmin, upload, rateLimit
utils/                # validators (zod), cache, helpers
database/             # Dump20250709.sql (full dump, pakai ini) + ddl.sql/dml.sql deprecated + migrate_add_role.js
uploads/images/       # Local uploads (/tmp on Vercel)
```

## API Reference

### Destinations

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/destinations` | No | List with pagination (`page`, `limit`) |
| `GET` | `/destinations/search` | No | Search + filters + `sort_by` + pagination |
| `GET` | `/destinations/:slug` | No | Detail by slug |
| `GET` | `/destinations/:slug/similar` | No | Similar destinations |
| `GET` | `/destinations/by-uuid/:uuid` | `admin`/`super_admin` | Detail by UUID (for edit) |
| `POST` | `/destinations` | `super_admin` | Create single destination |
| `PUT` | `/destinations/:uuid` | `super_admin` | Update destination |
| `DELETE` | `/destinations/:uuid` | `super_admin` | Delete destination + images |
| `POST` | `/destinations/bulk` | `super_admin` | Bulk create (rate limited) |
| `POST` | `/destinations/:uuid/upload-images` | `super_admin` | Upload up to 10 images |
| `GET` | `/destinations/:uuid/images` | No | List images |
| `DELETE` | `/destinations/:uuid/images/:imageId` | `super_admin` | Delete image |
| `PATCH` | `/destinations/:uuid/images/:imageId/primary` | `super_admin` | Set primary image |

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login, returns `Bearer` token |
| `GET` | `/auth/me` | Get current user (JWT) |

### Other

| Method | Path | Description |
|---|---|---|
| `GET` | `/recommendations/questions` | List active questions |
| `POST` | `/recommendations/sessions` | Create session |
| `POST` | `/recommendations/ai` | Get AI recommendations |
| `GET` | `/recommendations/results/:session_id` | Get results by session |
| `POST` | `/chatbot/chat` | Chat with EduBot |

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with `nodemon` (development) |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Demo Accounts

| Role | Email | Password | Access |
|---|---|---|---|
| Viewer (`admin`) | `demo@edusolo.local` | `Demo123!` | List/search destinations + view admin list (no write) |
| Owner (`super_admin`) | — | Set via `ADMIN_INITIAL_PASSWORD` env (never committed) | Full CRUD |

Viewers can log in at `POST /auth/login` and call `GET /destinations` or `GET /destinations/by-uuid/:uuid`; write endpoints return `403 Super admin only`.

## Deployment

- **Vercel:** Set env vars in Vercel Dashboard (Production): `DATABASE_URL` (or `MYSQL_*`), `JWT_SECRET`, `GROQ_API_KEY`, `ALLOWED_ORIGINS`, `BASE_URL`, `ADMIN_INITIAL_PASSWORD` (sensitive, masked)
- **Uploads:** On Vercel, files go to `/tmp` (ephemeral) — use Vercel Blob or S3 for persistence in production

## License

MIT

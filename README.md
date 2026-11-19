# InternHub — RESTful Backend API & Internship Board

A production-ready RESTful backend API for an Internship Board built with **Node.js**, **Express**, and **SQLite** (using `better-sqlite3` with strict parameterized queries). It also serves the companion accessible, responsive frontend web client.

---

## 📑 Table of Contents

- [Features](#-features)
- [Project Architecture](#-project-architecture)
- [Database Schema & Seed Data](#-database-schema--seed-data)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Seeding](#database-seeding)
  - [Running the Server](#running-the-server)
  - [Running Automated Tests](#running-automated-tests)
- [Consistent API Response Envelope](#-consistent-api-response-envelope)
- [API Reference](#-api-reference)
  - [Health Check](#1-health-check)
  - [List Internships](#2-list-internships-with-filtering--pagination)
  - [Get Internship by ID](#3-get-internship-by-id)
  - [Create Internship](#4-create-internship)
  - [Full Update Internship (PUT)](#5-full-update-internship-put)
  - [Partial Update Internship (PATCH)](#6-partial-update-internship-patch)
  - [Delete Internship](#7-delete-internship)
  - [Filter Metadata](#8-filter-metadata)
- [Frontend Client Integration](#-frontend-client-integration)
- [Validation & Error Handling](#-validation--error-handling)
- [License](#-license)

---

## ✨ Features

- **Robust REST API Architecture**: Clean separation of concerns with modular routes, database access, validation, and error-handling middleware.
- **SQLite with Parameterized Queries**: High-performance SQLite engine via `better-sqlite3`, WAL mode enabled, zero SQL injection risk using parameterized prepared statements.
- **Predictable API Envelopes**: Uniform JSON envelope structure across list endpoints, single-resource endpoints, and error responses.
- **Idempotent Database Seeding**: Safe script (`npm run seed`) populating the exact 5 specified seed records using SQLite `ON CONFLICT DO UPDATE`.
- **Filtering, Search & Pagination**: Query by domain, mode, location, specific skill, free-text search across multiple fields, custom sorting, and flexible page/limit pagination.
- **Strict Payload Validation**: Field validation for all mutations with structured error arrays.
- **Automated Test Suite**: 20 comprehensive end-to-end tests using Node's native test runner (`node --test`).
- **Integrated Full-Stack Experience**: Express statically serves the vanilla HTML5/CSS3 frontend, seamlessly connecting the UI to the backend.

---

## 🏗 Project Architecture

```
internship-board/
├── data/
│   └── internships.db       # SQLite database file (created on seed/start)
├── src/
│   ├── app.js               # Express app factory (middleware, static files, routes)
│   ├── db/
│   │   └── database.js      # SQLite connection, pragmas (WAL), auto-schema runner
│   ├── middleware/
│   │   ├── errorHandler.js  # 404 and global JSON error envelope handler
│   │   └── validate.js      # Payload validation for POST, PUT, and PATCH
│   └── routes/
│       ├── health.js        # Health check endpoint (/api/health)
│       └── internships.js   # Full CRUD REST endpoints (/api/internships)
├── test/
│   └── api.test.js          # Automated end-to-end test suite
├── .env.example             # Example environment variables
├── .env                     # Local environment file
├── .gitignore               # Git ignore rules for node_modules, DB, and logs
├── app.js                   # Frontend client script (with API integration)
├── index.html               # Frontend HTML5 UI
├── internships.json         # Reference JSON seed records
├── package.json             # NPM package definition and npm scripts
├── README.md                # Project documentation
├── schema.sql               # SQLite DDL schema and indexes
├── seed.js                  # Idempotent database seeding script
├── server.js                # Server entrypoint listening on PORT
└── styles.css               # Frontend CSS styles
```

---

## 🗄 Database Schema & Seed Data

### Schema (`schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS internships (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  mode TEXT NOT NULL CHECK(mode IN ('Remote', 'Hybrid', 'On-site')),
  location TEXT NOT NULL,
  skills TEXT NOT NULL, -- Stored as JSON array: e.g. '["HTML","CSS","JavaScript"]'
  openings INTEGER NOT NULL DEFAULT 1 CHECK(openings >= 0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internships_domain ON internships(domain);
CREATE INDEX IF NOT EXISTS idx_internships_mode ON internships(mode);
CREATE INDEX IF NOT EXISTS idx_internships_location ON internships(location);
CREATE INDEX IF NOT EXISTS idx_internships_created_at ON internships(created_at);
```

### Seed Data
The database is pre-seeded with 5 initial records:
- `INT-101`: Frontend Intern (Full Stack Development, Remote, India, `["HTML","CSS","JavaScript"]`, openings: 3)
- `INT-102`: API Engineering Intern (Full Stack Development, Hybrid, Pune, `["Node.js","SQL","Testing"]`, openings: 2)
- `INT-103`: UI/UX Intern (UI/UX, Remote, India, `["Figma","Research","Accessibility"]`, openings: 1)
- `INT-104`: Data Analyst Intern (Data Analytics, On-site, Bengaluru, `["Excel","SQL","Data visualisation"]`, openings: 2)
- `INT-105`: Security Operations Intern (Cyber Security, Remote, India, `["Linux","Logs","Networking"]`, openings: 1)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ or v24+ recommended)
- **npm**: v9.0.0 or later

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/rajasaravananbalamurugan/internship-board-api.git
cd internship-board-api
npm install
```

### Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Available environment variables:
| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `3000` | Port for the Express server to listen on |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`) |
| `DB_PATH` | `./data/internships.db` | Path to the SQLite database file |

### Database Seeding

Run the idempotent seed script to create the table and populate initial data:

```bash
npm run seed
```

Output:
```
◇ injected env from .env
✅ Seed complete! Seeded 5 records. Total records in database: 5.
```

*(You can run this command multiple times without duplicating any records).*

### Running the Server

#### Production / Standard Start:
```bash
npm start
```

#### Development Mode (with native watch):
```bash
npm run dev
```

The server will start at:
- Backend API: `http://localhost:3000/api/internships`
- Frontend UI: `http://localhost:3000/`

### Running Automated Tests

Run the comprehensive test suite:

```bash
npm test
```

Output:
```
✔ Internship Board REST API Test Suite
ℹ tests 20
ℹ suites 9
ℹ pass 20
ℹ fail 0
```

---

## 📦 Consistent API Response Envelope

Every endpoint returns a predictable JSON envelope structure:

### 1. List Response Envelope
```json
{
  "status": "success",
  "data": [
    {
      "id": "INT-101",
      "title": "Frontend Intern",
      "domain": "Full Stack Development",
      "mode": "Remote",
      "location": "India",
      "skills": ["HTML", "CSS", "JavaScript"],
      "openings": 3,
      "createdAt": "2026-11-20 00:00:00",
      "updatedAt": "2026-11-20 00:00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### 2. Single Resource / Mutation Envelope
```json
{
  "status": "success",
  "data": {
    "id": "INT-101",
    "title": "Frontend Intern",
    "domain": "Full Stack Development",
    "mode": "Remote",
    "location": "India",
    "skills": ["HTML", "CSS", "JavaScript"],
    "openings": 3
  }
}
```

### 3. Error Envelope
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title is required and must be a non-empty string"
    }
  ]
}
```

---

## 📡 API Reference

### 1. Health Check
Checks the server and uptime.

- **Method**: `GET`
- **URL**: `/api/health`
- **Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "status": "healthy",
    "uptime": 124,
    "timestamp": "2026-11-20T00:15:00.000Z"
  }
}
```

---

### 2. List Internships (with Filtering & Pagination)
Retrieve all internships matching optional filter, search, and pagination criteria.

- **Method**: `GET`
- **URL**: `/api/internships`
- **Query Parameters**:
  | Parameter | Type | Default | Description |
  |---|---|---|---|
  | `page` | integer | `1` | Page number (1-indexed) |
  | `limit` | integer | `10` | Number of items per page (max `100`) |
  | `search` | string | *none* | Case-insensitive search on title, domain, location, or skills |
  | `domain` | string | *none* | Filter by domain (e.g. `Full Stack Development`) |
  | `mode` | string | *none* | Filter by mode (`Remote`, `Hybrid`, `On-site`) |
  | `location` | string | *none* | Partial or full match on location (e.g. `India`, `Pune`) |
  | `skill` | string | *none* | Filter by required skill inside `skills` array (e.g. `SQL`) |
  | `sort` | string | `id` | Sort field: `id`, `title`, `domain`, `mode`, `location`, `openings`, `created_at` |
  | `order` | string | `asc` | Sort direction: `asc` or `desc` |

- **Example Request**:
  ```bash
  curl "http://localhost:3000/api/internships?mode=Remote&page=1&limit=2"
  ```

- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "INT-101",
        "title": "Frontend Intern",
        "domain": "Full Stack Development",
        "mode": "Remote",
        "location": "India",
        "skills": ["HTML", "CSS", "JavaScript"],
        "openings": 3,
        "createdAt": "2026-11-20 00:00:00",
        "updatedAt": "2026-11-20 00:00:00"
      },
      {
        "id": "INT-103",
        "title": "UI/UX Intern",
        "domain": "UI/UX",
        "mode": "Remote",
        "location": "India",
        "skills": ["Figma", "Research", "Accessibility"],
        "openings": 1,
        "createdAt": "2026-11-20 00:00:00",
        "updatedAt": "2026-11-20 00:00:00"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 2,
      "total": 3,
      "totalPages": 2
    }
  }
  ```

---

### 3. Get Internship by ID
Retrieve a single internship by its unique identifier.

- **Method**: `GET`
- **URL**: `/api/internships/:id`
- **Example Request**:
  ```bash
  curl http://localhost:3000/api/internships/INT-102
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": {
      "id": "INT-102",
      "title": "API Engineering Intern",
      "domain": "Full Stack Development",
      "mode": "Hybrid",
      "location": "Pune",
      "skills": ["Node.js", "SQL", "Testing"],
      "openings": 2,
      "createdAt": "2026-11-20 00:00:00",
      "updatedAt": "2026-11-20 00:00:00"
    }
  }
  ```
- **Error (404)**:
  ```json
  {
    "status": "error",
    "message": "Internship with ID 'INT-999' not found"
  }
  ```

---

### 4. Create Internship
Add a new internship role. If `id` is omitted, the next sequential ID (e.g. `INT-106`) is automatically assigned.

- **Method**: `POST`
- **URL**: `/api/internships`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "DevOps Engineer Intern",
    "domain": "Cloud & Infrastructure",
    "mode": "Remote",
    "location": "India",
    "skills": ["Docker", "Kubernetes", "Linux"],
    "openings": 2
  }
  ```
- **Example Request**:
  ```bash
  curl -X POST http://localhost:3000/api/internships \
    -H "Content-Type: application/json" \
    -d '{
      "title": "DevOps Engineer Intern",
      "domain": "Cloud & Infrastructure",
      "mode": "Remote",
      "location": "India",
      "skills": ["Docker", "Kubernetes", "Linux"],
      "openings": 2
    }'
  ```
- **Response**: `201 Created`
  ```json
  {
    "status": "success",
    "data": {
      "id": "INT-106",
      "title": "DevOps Engineer Intern",
      "domain": "Cloud & Infrastructure",
      "mode": "Remote",
      "location": "India",
      "skills": ["Docker", "Kubernetes", "Linux"],
      "openings": 2,
      "createdAt": "2026-11-20 00:15:30",
      "updatedAt": "2026-11-20 00:15:30"
    }
  }
  ```

---

### 5. Full Update Internship (PUT)
Replaces all mutable fields for an existing internship.

- **Method**: `PUT`
- **URL**: `/api/internships/:id`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "title": "Senior Frontend Intern",
    "domain": "Full Stack Development",
    "mode": "Remote",
    "location": "India",
    "skills": ["React", "TypeScript", "Tailwind CSS"],
    "openings": 4
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": {
      "id": "INT-101",
      "title": "Senior Frontend Intern",
      "domain": "Full Stack Development",
      "mode": "Remote",
      "location": "India",
      "skills": ["React", "TypeScript", "Tailwind CSS"],
      "openings": 4,
      "createdAt": "2026-11-20 00:00:00",
      "updatedAt": "2026-11-20 00:16:00"
    }
  }
  ```

---

### 6. Partial Update Internship (PATCH)
Updates only the specified fields of an existing internship.

- **Method**: `PATCH`
- **URL**: `/api/internships/:id`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "openings": 5,
    "mode": "Hybrid"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": {
      "id": "INT-101",
      "title": "Frontend Intern",
      "domain": "Full Stack Development",
      "mode": "Hybrid",
      "location": "India",
      "skills": ["HTML", "CSS", "JavaScript"],
      "openings": 5,
      "createdAt": "2026-11-20 00:00:00",
      "updatedAt": "2026-11-20 00:16:45"
    }
  }
  ```

---

### 7. Delete Internship
Permanently deletes an internship record by ID.

- **Method**: `DELETE`
- **URL**: `/api/internships/:id`
- **Example Request**:
  ```bash
  curl -X DELETE http://localhost:3000/api/internships/INT-105
  ```
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": {
      "id": "INT-105",
      "deleted": true,
      "title": "Security Operations Intern"
    }
  }
  ```

---

### 8. Filter Metadata
Retrieves unique domains, modes, and locations from stored records.

- **Method**: `GET`
- **URL**: `/api/internships/meta/filters`
- **Response**: `200 OK`
  ```json
  {
    "status": "success",
    "data": {
      "domains": [
        "Cyber Security",
        "Data Analytics",
        "Full Stack Development",
        "UI/UX"
      ],
      "modes": [
        "Hybrid",
        "On-site",
        "Remote"
      ],
      "locations": [
        "Bengaluru",
        "India",
        "Pune"
      ],
      "total": 5
    }
  }
  ```

---

## 💻 Frontend Client Integration

The application includes an accessible frontend built with semantic HTML5, CSS Grid, and vanilla JavaScript:
- When the Express server is running, navigating to `http://localhost:3000/` serves `index.html`.
- The client script (`app.js`) fetches directly from `/api/internships?limit=100`.
- If accessed offline without the backend, `app.js` gracefully falls back to the static `internships.json` file.

---

## 🛡 Validation & Error Handling

All incoming mutation requests are validated by middleware (`src/middleware/validate.js`):
- `title`: Required string, 2-120 characters.
- `domain`: Required string, 2-80 characters.
- `mode`: Must be one of `Remote`, `Hybrid`, or `On-site` (case-insensitive, normalized).
- `location`: Required string, 2-80 characters.
- `skills`: Required array of non-empty strings (at least 1 skill).
- `openings`: Non-negative integer (`>= 0`).
- `id`: Optional; if supplied on `POST`, validated for duplicate conflict (`409 Conflict`).

### HTTP Status Codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Payload validation failed or malformed JSON.
- `404 Not Found`: Endpoint or resource ID does not exist.
- `409 Conflict`: Resource with requested ID already exists.
- `500 Internal Server Error`: Centralized server-side error handling.

---

## 📜 License

MIT License. Free to use and modify.

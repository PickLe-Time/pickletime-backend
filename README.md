# 🥒🕒 PickLeTime Backend

This is the **backend API** for the PickLeTime app. It's built using **Fastify** and **Prisma ORM**, written in **JavaScript (JS)**, and connects to a **PostgreSQL** database container managed through the included Docker Compose file.

Documentation for API endpoints can be found on the [wiki page](https://github.com/PickLe-Time/pickletime-backend/wiki/API-Endpoint-Reference).

## 🚀 Tech Stack

- [Fastify](https://www.fastify.io/) – Fast and low-overhead web framework
- [Prisma](https://www.prisma.io/) – Type-safe ORM for PostgreSQL
- [JavaScript (JS)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [PostgreSQL](https://www.postgresql.org/) – SQL database (via Docker)
- [Docker](https://www.docker.com/) + Docker Compose (managed from `pickletime-infra`)

---

## 🛠️ Local Development

### Prerequisites

- [Node.js](https://nodejs.org/en/download) (>= 18)
- [Docker Engine](https://docs.docker.com/engine/) / [Docker Desktop](https://docs.docker.com/desktop/)

### Setup

```bash
# Clone the repo
git clone https://github.com/PickLe-Time/pickletime-backend.git
cd pickletime-backend

# Install dependencies
npm install
````

### Environment Variables

Configure `.env.example` and rename to `.env`:

```env
# JWT access and refresh credentials. (Use your own code)
JWT_TOKEN_SECRET=""

# Database Info
DATABASE_URL="postgresql://PGUSER:PGPASSWORD@localhost:5432/pickletimedb" # DATABASE_URL="postgresql://PGUSER:PGPASSWORD@postgres:5432/pickletimedb"
POSTGRES_USER=""
POSTGRES_PASSWORD=""
POSTGRES_DB="pickletimedb"
```

- Change `JWT_TOKEN_SECRET` to your secret JWT token, usually a long random string.
- Adjust `DATABASE_URL` to your connection string to your database. Change the PGUSER and PGPASSWORD fields. Change localhost or postgres whether you're running a container or Postgres locally.
- Change `POSTGRES_USER` to your Postgres username.
- Change `POSTGRES_PASSWORD` to Postgres password.

## 🔧 Prisma Setup

Before running the backend, make sure Prisma is initialized and connected to the database.

### Generate Prisma Client

This creates the Prisma client based on the current schema.
```bash
npx prisma generate
```

Run Migrations (Dev Environment)
```bash
npx prisma migrate dev --name init
```

## 🐳 Docker Options

The backend can be containerized and run using **Docker Compose** in two different contexts:

---

### ⚙️ Option 1: Full Stack Deployment (via `pickletime-infra`)

Use this when running the **entire Pickletime stack** (frontend, backend, database, reverse proxy) with HTTPS and production-level setup.

> **Recommended for development and deployment with other services.**

#### 🧱 Prerequisites

Ensure the following repositories are cloned in sibling directories:

```bash
git clone https://github.com/pickletime/pickletime-frontend.git
git clone https://github.com/pickletime/pickletime-backend.git
git clone https://github.com/pickletime/pickletime-infra.git
```

#### ▶️ Run via Docker Compose

From inside the `pickletime-infra` directory:

```bash
docker-compose up --build
```

#### 🔗 Service URLs

* Backend (proxied): `https://localhost/api`
* Database: runs as the `postgres` service inside the Docker network
* Prisma connection: `postgresql://postgres:postgres@db:5432/pickletime`


### 🧪 Option 2: Standalone Backend + Postgres (local development)

Use this for **isolated backend development and testing**.
> This `docker-compose.yml` is located inside the backend repo.

```bash
docker-compose up --build
```

The backend will be available at: [http://localhost:5000](http://localhost:5000)

You can now:

* Run Prisma migrations
* Test endpoints directly
* Develop in isolation without the full frontend/proxy stack

---

## Run the Dev Server

```bash
npm run start
```

Server runs at: [http://localhost:5000](http://localhost:5000)



# Member 5 — DevOps Spec (Week 1)

## Scope
Docker, deployment, CI/CD scaffolding, backups.

## Status: COMPLETE (Week 1)

## Deliverables

| File | Purpose |
|------|---------|
| `docker/docker-compose.yml` | Full stack: Postgres, Redis, Backend, Frontend, Nginx |
| `docker/Dockerfile.backend` | Multi-stage NestJS build |
| `docker/Dockerfile.frontend` | Multi-stage Next.js build |
| `docker/nginx.conf` | Reverse proxy routing |
| `docker/backup.sh` | PostgreSQL backup with retention |
| `.github/workflows/ci.yml` | CI pipeline |

## Quick Start
```bash
cp .env.example .env
docker compose -f docker/docker-compose.yml up -d postgres redis
pnpm install
pnpm db:migrate && pnpm db:seed
pnpm dev
```

## Full Docker Deploy
```bash
docker compose -f docker/docker-compose.yml up -d --build
```

## n8n (Week 5)
```bash
docker compose -f docker/docker-compose.yml --profile automation up -d n8n
```

## Per-Client Deployment
Each client gets:
1. Clone repo (or pull image)
2. Set `.env` with unique `DATABASE_URL`, `JWT_SECRET`, branding vars
3. `docker compose up -d`
4. Run migrations + seed

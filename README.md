# CRM Platform

Agency-first CRM — one codebase, per-client deployments. Modern UI inspired by Linear, Notion, and Stripe.

## Deliverables

### Week 1
| Track | Status | Deliverable |
|-------|--------|-------------|
| Architecture Docs | Done | Schema, API contract, design system |
| Member 1 — Backend Core | Done | Auth, Users, Roles, Audit, Prisma, Redis/BullMQ |
| Member 3 — Design System | Done | UI package, layout shell, all Week 1 components |
| Member 5 — DevOps | Done | Docker Compose, Nginx, CI, backup scripts |

### Week 2
| Track | Status | Deliverable |
|-------|--------|-------------|
| Member 2 — CRM Backend | Done | Leads, Customers, Tasks, Reports APIs |
| Member 4 — Frontend CRM | Done | Dashboard, Leads, Customers, Tasks pages + API integration |

### Week 3
| Track | Status | Deliverable |
|-------|--------|-------------|
| Member 2 — Pipeline & Deals | Done | Pipelines, Deals, Follow-ups, Settings, extended Reports APIs |
| Member 4 — Pipeline UI | Done | Deals Kanban, Reports page, Settings profile editing |

### Week 4
| Track | Status | Deliverable |
|-------|--------|-------------|
| CSV Import/Export | Done | Leads & customers CSV with async BullMQ jobs |
| Notifications | Done | In-app notifications with navbar bell + panel |
| Attachments | Done | File upload/download on leads & customers |

## Week 5 Preview

- n8n Integration (Email, WhatsApp, Automations)
- Email queue processor

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind, shadcn-style components, Framer Motion, TanStack Query
- **Backend:** NestJS, PostgreSQL, Prisma, JWT, BullMQ, Redis
- **Deploy:** Docker, Nginx, VPS-ready

## Project Structure

```
crm-platform/
├── apps/
│   ├── frontend/     # Next.js 15 UI
│   ├── backend/      # NestJS API
│   └── automation/   # n8n (Week 5)
├── packages/
│   ├── ui/           # Design system
│   ├── shared-types/ # Shared TypeScript types
│   └── utils/        # Shared utilities
├── docs/             # Architecture & specs
└── docker/           # Deployment configs
```

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker (for Postgres & Redis)

### 1. Install
```bash
pnpm install
cp .env.example .env
```

### 2. Start infrastructure
```bash
docker compose -f docker/docker-compose.yml up -d postgres redis
```

### 3. Setup database
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Run dev servers
```bash
pnpm dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs
- Design System: http://localhost:3000/design-system

### Default Login
- Email: `admin@crm.local`
- Password: `Admin123!`

## Docker (Full Stack)
```bash
docker compose -f docker/docker-compose.yml up -d --build
```

## Documentation

| Doc | Path |
|-----|------|
| Architecture | `docs/ARCHITECTURE.md` |
| Database Schema | `docs/DATABASE_SCHEMA.md` |
| API Contract | `docs/API_CONTRACT.md` |
| Design System | `docs/DESIGN_SYSTEM.md` |
| Member 1 Spec | `docs/specs/MEMBER_1_BACKEND_CORE.md` |
| Member 3 Spec | `docs/specs/MEMBER_3_DESIGN_SYSTEM.md` |
| Member 5 Spec | `docs/specs/MEMBER_5_DEVOPS.md` |

## Week 3 Preview

- Deals / Pipeline module + Kanban pipeline view
- Full Reports page
- Settings enhancements
- CSV import/export

# CRM Platform — Architecture Document

## Deployment Model: Agency First

Each client receives an **isolated deployment** — same codebase, different configuration.

```
One Codebase
     │
     ├── Client A → Frontend A + Backend A + Database A
     ├── Client B → Frontend B + Backend B + Database B
     └── Client C → Frontend C + Backend C + Database C
```

**Per-client configuration only:**
- Logo & branding
- Colors & theme
- Domain
- Enabled modules
- Dedicated PostgreSQL database

---

## Monorepo Structure

```
crm-platform/
├── apps/
│   ├── frontend/       # Next.js 15 — client UI
│   ├── backend/        # NestJS — REST API
│   └── automation/     # n8n workflows (Week 5+)
├── packages/
│   ├── ui/             # Shared design system components
│   ├── shared-types/   # TypeScript types shared across apps
│   └── utils/          # Shared utilities
├── docs/               # Architecture, API, schema, design specs
└── docker/             # Docker & deployment configs
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query, React Hook Form, Zod |
| Backend | Node.js, NestJS, PostgreSQL, Prisma, JWT Auth, BullMQ, Redis |
| Deployment | Docker, VPS, PostgreSQL, Nginx, Self-hosted n8n |

---

## Module Boundaries

### Backend Core (Week 1 — Member 1)
- Authentication (login, register, forgot password, JWT refresh)
- Users, Roles, Permissions (RBAC)
- Audit Logs
- Infrastructure (Prisma, Redis, BullMQ)

### CRM Business Logic (Week 2+ — Member 2)
- Leads, Customers, Deals, Pipeline, Tasks, Follow-ups, Reports
- **Depends on:** Auth Module, User Module

### Frontend Core (Week 1 — Member 3)
- Design system, layout shell, reusable components
- **No API dependency** — can start Day 1

### Frontend CRM Features (Week 2+ — Member 4)
- Dashboard, Leads, Customers, Deals, Tasks, Reports, Settings pages
- **Depends on:** Design System + Backend APIs

### DevOps (Week 1 — Member 5)
- Docker Compose, Nginx, CI/CD scaffolding, backup scripts

---

## Authentication Flow

```
Client → POST /api/v1/auth/login
       → Backend validates credentials
       → Returns { accessToken, refreshToken, user }
       → Client stores tokens (httpOnly cookie or secure storage)
       → Subsequent requests: Authorization: Bearer <accessToken>
       → On 401: POST /api/v1/auth/refresh
```

---

## RBAC Model

```
User ──N:1── Role ──N:M── Permission
```

- Permissions are granular: `leads:read`, `leads:write`, `deals:delete`, etc.
- Roles group permissions: `admin`, `manager`, `sales_rep`, `viewer`
- `@RequirePermissions('leads:read')` decorator on controllers

---

## API Versioning

All endpoints prefixed: `/api/v1/`

Standard response envelope:

```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
```

Error envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": []
  }
}
```

---

## Environment Variables (Per Client)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Client-specific PostgreSQL connection |
| `JWT_SECRET` | Client-specific JWT signing key |
| `JWT_REFRESH_SECRET` | Refresh token signing key |
| `REDIS_URL` | Redis for BullMQ & sessions |
| `APP_NAME` | Client display name |
| `APP_LOGO_URL` | Client logo URL |
| `PRIMARY_COLOR` | Brand primary color (hex) |
| `ENABLED_MODULES` | Comma-separated module list |

---

## Development Sequence

| Week | Focus |
|------|-------|
| 1 | Auth, Roles, DB, Design System, Docker |
| 2 | Leads, Tasks, Customers APIs + mock UI pages |
| 3 | API integration, Pipeline, Reports, Settings |
| 4 | CSV Import/Export, Notifications, Attachments |
| 5 | n8n Integration (Email, WhatsApp, Automations) |
| 6 | MVP polish & client demos |

---

## Design Philosophy

**Not:** Old admin dashboard, Bootstrap look.

**Yes:** Linear, Notion, Stripe, Attio, Raycast, Vercel aesthetic.

- Generous whitespace, rounded corners, subtle glassmorphism
- Beautiful tables, smooth animations, skeleton loaders
- Command palette, keyboard shortcuts
- Dark + light mode, fully responsive

# Member 1 — Backend Core Spec (Week 1)

## Scope
Authentication, Users, Roles, Permissions, Audit Logs, Infrastructure.

## Status: COMPLETE (Week 1)

## Modules Delivered

| Module | Path | Endpoints |
|--------|------|-----------|
| Auth | `apps/backend/src/auth/` | login, register, refresh, logout, forgot/reset password, me |
| Users | `apps/backend/src/users/` | CRUD + soft delete |
| Roles | `apps/backend/src/roles/` | CRUD + permission management |
| Audit | `apps/backend/src/audit/` | List with filters |
| Health | `apps/backend/src/health/` | Health check |

## Database
- Prisma schema: `apps/backend/prisma/schema.prisma`
- Seed: `apps/backend/prisma/seed.ts`
- Default admin: `admin@crm.local` / `Admin123!`

## Commands
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev:backend
```

## Dependencies for Member 2
Member 2 can start Week 2 using:
- `@RequirePermissions()` decorator
- `AuditService.log()` for audit trails
- `CurrentUser` decorator for actor ID
- JWT auth on all protected routes

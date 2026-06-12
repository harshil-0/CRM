# Member 2 — CRM Backend Spec (Week 2)

## Status: COMPLETE

## Modules Delivered

| Module | Path | Endpoints |
|--------|------|-----------|
| Leads | `apps/backend/src/leads/` | CRUD + assign + convert |
| Customers | `apps/backend/src/customers/` | CRUD |
| Tasks | `apps/backend/src/tasks/` | CRUD |
| Reports | `apps/backend/src/reports/` | GET summary |

## Lead Operations

- **Create** — `POST /leads`
- **Update** — `PATCH /leads/:id`
- **Assign** — `POST /leads/:id/assign` (requires `leads:assign`)
- **Convert** — `POST /leads/:id/convert` — creates Customer, marks lead as won

## Lead Statuses

`new` → `contacted` → `qualified` → `proposal` → `negotiation` → `won` | `lost`

## Database

Migration: `20250615000000_crm_modules`
Models: Lead, Customer, Task, FollowUp (schema ready, API Week 3+)

## Seed Data

6 sample leads + 4 sample tasks created on first seed run.

# Database Schema

> PostgreSQL via Prisma ORM. Each client deployment has its own database instance.

---

## Entity Relationship Overview

```
┌──────────┐     ┌──────────────┐     ┌────────────┐
│   User   │────▶│     Role     │◀───▶│ Permission │
└──────────┘     └──────────────┘     └────────────┘
     │                                       
     ▼                                       
┌──────────────┐     ┌─────────────────┐
│ RefreshToken │     │    AuditLog     │
└──────────────┘     └─────────────────┘
```

---

## Core Tables (Week 1)

### `users`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| email | VARCHAR(255) | Unique, indexed |
| password_hash | VARCHAR(255) | bcrypt |
| first_name | VARCHAR(100) | |
| last_name | VARCHAR(100) | |
| avatar_url | VARCHAR(500) | Nullable |
| phone | VARCHAR(20) | Nullable |
| role_id | UUID | FK → roles.id |
| is_active | BOOLEAN | Default true |
| email_verified | BOOLEAN | Default false |
| last_login_at | TIMESTAMPTZ | Nullable |
| password_reset_token | VARCHAR(255) | Nullable |
| password_reset_expires | TIMESTAMPTZ | Nullable |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `roles`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(50) | Unique: admin, manager, sales_rep, viewer |
| display_name | VARCHAR(100) | |
| description | TEXT | Nullable |
| is_system | BOOLEAN | Cannot delete system roles |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `permissions`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | VARCHAR(100) | Unique: `module:action` format |
| display_name | VARCHAR(100) | |
| module | VARCHAR(50) | leads, deals, users, etc. |
| action | VARCHAR(50) | read, write, delete, assign |
| created_at | TIMESTAMPTZ | |

### `role_permissions`

| Column | Type | Notes |
|--------|------|-------|
| role_id | UUID | FK → roles.id |
| permission_id | UUID | FK → permissions.id |
| | | Composite PK (role_id, permission_id) |

### `refresh_tokens`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users.id |
| token | VARCHAR(500) | Hashed |
| expires_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| revoked_at | TIMESTAMPTZ | Nullable |

### `audit_logs`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → users.id, nullable for system |
| action | VARCHAR(100) | CREATE, UPDATE, DELETE, LOGIN, etc. |
| entity | VARCHAR(50) | users, leads, deals, etc. |
| entity_id | UUID | Nullable |
| old_values | JSONB | Nullable |
| new_values | JSONB | Nullable |
| ip_address | VARCHAR(45) | Nullable |
| user_agent | TEXT | Nullable |
| created_at | TIMESTAMPTZ | Indexed |

---

## CRM Tables (Week 2+ — Reference Only)

> Defined here for schema continuity. Implemented in Week 2.

### `leads`
id, title, email, phone, company, source, status, assigned_to (FK users), score, notes, converted_at, created_by, created_at, updated_at

### `customers`
id, name, email, phone, company, address, tags[], assigned_to, created_by, created_at, updated_at

### `deals`
id, title, value, currency, stage, pipeline_id, customer_id, assigned_to, expected_close_date, probability, created_by, created_at, updated_at

### `pipelines`
id, name, stages (JSONB), is_default, created_at, updated_at

### `tasks`
id, title, description, due_date, priority, status, assigned_to, related_entity, related_entity_id, created_by, created_at, updated_at

### `follow_ups`
id, task_id, lead_id, customer_id, scheduled_at, completed_at, notes, created_by, created_at

---

## Seed Data

### Default Roles
- `admin` — All permissions
- `manager` — All except user/role management
- `sales_rep` — Leads, customers, deals, tasks (own + assigned)
- `viewer` — Read-only across modules

### Default Permissions (Week 1 scope)
```
users:read, users:write, users:delete
roles:read, roles:write
audit:read
leads:read, leads:write, leads:delete, leads:assign
customers:read, customers:write, customers:delete
deals:read, deals:write, deals:delete
tasks:read, tasks:write, tasks:delete
reports:read
settings:read, settings:write
```

### Default Admin User
- email: `admin@crm.local`
- password: Set via `ADMIN_PASSWORD` env var on first seed

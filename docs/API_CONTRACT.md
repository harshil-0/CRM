# API Contract

> Base URL: `/api/v1`  
> Auth: `Authorization: Bearer <accessToken>`  
> Content-Type: `application/json`

---

## Auth Module (Member 1 — Week 1)

### POST `/auth/register`
Register a new user. Admin-only in production; open in dev.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Doe",
  "roleId": "uuid-optional"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "role": { "id": "uuid", "name": "sales_rep", "displayName": "Sales Rep" }
  }
}
```

### POST `/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "avatarUrl": null,
      "role": { "id": "uuid", "name": "admin", "displayName": "Administrator" },
      "permissions": ["leads:read", "leads:write", "..."]
    }
  }
}
```

### POST `/auth/refresh`
**Request:**
```json
{ "refreshToken": "eyJ..." }
```

**Response 200:** Same shape as login (new token pair).

### POST `/auth/logout`
**Request:**
```json
{ "refreshToken": "eyJ..." }
```

**Response 200:**
```json
{ "success": true, "data": { "message": "Logged out successfully" } }
```

### POST `/auth/forgot-password`
**Request:**
```json
{ "email": "user@example.com" }
```

**Response 200:** Always returns success (no email enumeration).

### POST `/auth/reset-password`
**Request:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Response 200:**
```json
{ "success": true, "data": { "message": "Password reset successfully" } }
```

### GET `/auth/me`
**Response 200:** Current user profile + permissions.

---

## Users Module (Member 1 — Week 1)

### GET `/users` — Requires `users:read`
**Query:** `page`, `limit`, `search`, `roleId`, `isActive`

Paginated list of users with role info.

### GET `/users/assignable` — JWT only
Returns active users (id, name, email) for assignment pickers in leads, tasks, customers.

### GET `/users/:id` — Requires `users:read`
Single user by ID.

### POST `/users` — Requires `users:write`
### PATCH `/users/:id` — Requires `users:write`
### DELETE `/users/:id` — Requires `users:delete` (soft delete: sets isActive=false)

---

## Roles Module (Member 1 — Week 1)

### GET `/roles`
### GET `/roles/:id`
### POST `/roles` — Requires `roles:write`
### PATCH `/roles/:id` — Requires `roles:write`
### DELETE `/roles/:id` — Requires `roles:write` (non-system roles only)

### GET `/roles/:id/permissions`
### PUT `/roles/:id/permissions` — Requires `roles:write`

**Request:**
```json
{ "permissionIds": ["uuid1", "uuid2"] }
```

### GET `/permissions`
List all available permissions.

---

## Audit Logs Module (Member 1 — Week 1)

### GET `/audit-logs`
**Query:** `page`, `limit`, `userId`, `entity`, `action`, `from`, `to`  
**Requires:** `audit:read`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "user": { "firstName": "Jane", "lastName": "Doe", "email": "jane@example.com" },
      "action": "UPDATE",
      "entity": "users",
      "entityId": "uuid",
      "oldValues": { "isActive": true },
      "newValues": { "isActive": false },
      "ipAddress": "192.168.1.1",
      "createdAt": "2026-06-08T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 200 }
}
```

---

## Leads Module (Week 2)

### GET `/leads`
**Query:** `page`, `limit`, `search`, `status`, `assignedToId`, `source`  
**Requires:** `leads:read`

### GET `/leads/:id` — Requires `leads:read`
### POST `/leads` — Requires `leads:write`
### PATCH `/leads/:id` — Requires `leads:write`
### POST `/leads/:id/assign` — Requires `leads:assign`
```json
{ "assignedToId": "uuid" }
```
### POST `/leads/:id/convert` — Requires `leads:write`
Converts lead to customer. Returns `{ lead, customer }`.
### DELETE `/leads/:id` — Requires `leads:delete`

**Lead statuses:** `new`, `contacted`, `qualified`, `proposal`, `negotiation`, `won`, `lost`

---

## Customers Module (Week 2)

### GET `/customers`
**Query:** `page`, `limit`, `search`, `assignedToId`, `tag`  
**Requires:** `customers:read`

### GET `/customers/:id` — Requires `customers:read`
### POST `/customers` — Requires `customers:write`
### PATCH `/customers/:id` — Requires `customers:write`
### DELETE `/customers/:id` — Requires `customers:delete`

---

## Tasks Module (Week 2)

### GET `/tasks`
**Query:** `page`, `limit`, `search`, `status`, `priority`, `assignedToId`, `relatedEntity`  
**Requires:** `tasks:read`

### GET `/tasks/:id` — Requires `tasks:read`
### POST `/tasks` — Requires `tasks:write`
### PATCH `/tasks/:id` — Requires `tasks:write`
### DELETE `/tasks/:id` — Requires `tasks:delete`

**Task statuses:** `pending`, `in_progress`, `completed`, `cancelled`  
**Priorities:** `low`, `medium`, `high`, `urgent`

---

## Reports Module (Week 2)

### GET `/reports/summary` — Requires `reports:read`
Returns totals, leads/tasks by status, recent leads.

---

## Pipelines Module (Week 3)

### GET `/pipelines` — Requires `deals:read`
### GET `/pipelines/default` — Requires `deals:read`
### GET `/pipelines/:id` — Requires `deals:read`
### POST `/pipelines` — Requires `deals:write`
### PATCH `/pipelines/:id` — Requires `deals:write`
### DELETE `/pipelines/:id` — Requires `deals:write`

---

## Deals Module (Week 3)

### GET `/deals` — Requires `deals:read`
### GET `/deals/pipeline/:pipelineId` — Kanban board data
### GET `/deals/:id` — Requires `deals:read`
### POST `/deals` — Requires `deals:write`
### PATCH `/deals/:id` — Requires `deals:write`
### POST `/deals/:id/move` — `{ "stage": "qualified" }`
### DELETE `/deals/:id` — Requires `deals:delete`

---

## Follow-ups Module (Week 3)

### GET `/follow-ups` — Requires `tasks:read`
### POST `/follow-ups` — Requires `tasks:write`
### POST `/follow-ups/:id/complete` — Requires `tasks:write`
### DELETE `/follow-ups/:id` — Requires `tasks:delete`

---

## Settings Module (Week 3)

### GET `/settings/client` — Requires `settings:read`
### PATCH `/settings/profile` — Update own profile (firstName, lastName, phone)

---

## Reports Extended (Week 3)

### GET `/reports/deals` — Pipeline breakdown with weighted forecast
### GET `/reports/activity` — Recent audit activity (30 days)

---

## Import / Export (Week 4)

### GET `/export/leads` — Requires `leads:read` — Returns CSV file
### GET `/export/customers` — Requires `customers:read` — Returns CSV file
### POST `/import/leads` — Requires `leads:write` — Multipart CSV upload, returns import job
### POST `/import/customers` — Requires `customers:write` — Multipart CSV upload
### GET `/import/jobs/:id` — Poll import job status

**Lead CSV columns:** `title,email,phone,company,source,status,score,notes`  
**Customer CSV columns:** `name,email,phone,company,address,tags` (tags semicolon-separated)

---

## Notifications (Week 4)

### GET `/notifications` — List user notifications (`?unreadOnly=true`)
### GET `/notifications/unread-count` — Badge count
### PATCH `/notifications/:id/read` — Mark one as read
### POST `/notifications/read-all` — Mark all as read

---

## Attachments (Week 4)

### GET `/attachments?entity=leads&entityId=uuid` — List attachments
### POST `/attachments?entity=leads&entityId=uuid` — Upload file (multipart, max 10MB)
### GET `/attachments/:id/download` — Download file
### DELETE `/attachments/:id` — Delete attachment

**Allowed entities:** `leads`, `customers`, `deals`, `tasks`  
**Allowed types:** PDF, images, CSV, TXT, DOCX, XLSX

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate email, etc. |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Pagination Defaults

- `page`: 1 (min 1)
- `limit`: 20 (max 100)
- Sort: `createdAt` desc unless specified

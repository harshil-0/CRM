# Week 4 — Import/Export, Notifications, Attachments

## Status: COMPLETE

## Backend Modules

| Module | Path | Features |
|--------|------|----------|
| Notifications | `src/notifications/` | In-app notifications, unread count, mark read |
| Attachments | `src/attachments/` | Upload, download, delete (local disk) |
| Import/Export | `src/import-export/` | CSV import (BullMQ async), CSV export |

## API Endpoints

### Import / Export
- `GET /export/leads` — Download leads CSV
- `GET /export/customers` — Download customers CSV
- `POST /import/leads` — Upload CSV, returns job ID
- `POST /import/customers` — Upload CSV, returns job ID
- `GET /import/jobs/:id` — Poll import job status

### Notifications
- `GET /notifications` — List notifications
- `GET /notifications/unread-count` — Badge count
- `PATCH /notifications/:id/read` — Mark one read
- `POST /notifications/read-all` — Mark all read

### Attachments
- `GET /attachments?entity=&entityId=` — List files
- `POST /attachments?entity=&entityId=` — Upload (multipart)
- `GET /attachments/:id/download` — Download file
- `DELETE /attachments/:id` — Delete file

## Database Models
- `notifications` — User notifications
- `attachments` — File metadata + local path
- `import_jobs` — CSV import job tracking

## BullMQ Queues
- `import` — Async CSV processing with ImportProcessor

## Environment
- `UPLOAD_DIR=./uploads` — Local file storage path

## CSV Format

### Leads
`title,email,phone,company,source,status,score,notes`

### Customers
`name,email,phone,company,address,tags` (tags semicolon-separated)

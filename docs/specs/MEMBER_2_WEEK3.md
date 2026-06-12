# Member 2 — Week 3 Backend Additions

## Status: COMPLETE

## New Modules

| Module | Endpoints |
|--------|-----------|
| Pipelines | CRUD + `GET /pipelines/default` |
| Deals | CRUD + `GET /deals/pipeline/:id` + `POST /deals/:id/move` |
| Follow-ups | CRUD + `POST /follow-ups/:id/complete` |
| Settings | `GET /settings/client`, `PATCH /settings/profile` |
| Reports (extended) | `GET /reports/deals`, `GET /reports/activity` |

## Default Pipeline Stages

lead → qualified → proposal → negotiation → won → lost

## Seed

- 1 default pipeline with 5 sample deals
- 1 sample follow-up linked to a lead

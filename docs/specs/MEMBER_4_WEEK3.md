# Member 4 — Week 3 Frontend Additions

## Status: COMPLETE

## New Pages

| Page | Features |
|------|----------|
| `/deals` | Pipeline Kanban + table view, create deal, move stages, delete |
| `/reports` | Full analytics — metrics, charts, pipeline breakdown, activity log |
| `/settings` | Editable profile, workspace config, role/permissions view |

## Enhanced Pages

| Page | Changes |
|------|---------|
| `/dashboard` | Pipeline value + deal count metrics |
| `/tasks` | Upcoming follow-ups section |

## New Hooks

- `use-deals.ts`, `use-pipelines.ts`, `use-follow-ups.ts`, `use-settings.ts`
- Extended `use-reports.ts` with deals + activity reports

# Member 3 — Design System Spec (Week 1)

## Scope
UI foundation, layout shell, reusable components.

## Status: COMPLETE (Week 1)

## Package
`packages/ui` — shared component library

## Components Delivered

| Category | Components |
|----------|------------|
| Primitives | Button, Input, Badge, Card, Skeleton, Avatar, Dialog |
| Data | DataTable, SearchBar, KanbanBoard, AreaChart, BarChart |
| Navigation | CommandPalette (Cmd+K) |
| Layout | AppShell, Sidebar, Navbar, PageHeader |
| Feedback | EmptyState |

## Design Tokens
- CSS variables in `apps/frontend/src/app/globals.css`
- Tailwind config: `apps/frontend/tailwind.config.ts`
- Full spec: `docs/DESIGN_SYSTEM.md`

## Demo Page
`/design-system` — live component showcase

## Usage (Member 4)
```tsx
import { PageHeader, DataTable, Button } from '@crm/ui';
```

## Conventions
- Framer Motion for page/element animations
- Lucide icons (16px inline, 20px nav)
- Dark mode via `next-themes`
- All tables use `DataTable` component

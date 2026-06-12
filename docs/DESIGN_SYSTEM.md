# Design System Specification

> Member 3 deliverable. All frontend agents MUST follow this spec.

---

## Design Philosophy

Inspired by **Linear**, **Notion**, **Stripe**, **Attio**, **Raycast**, **Vercel**.

| Principle | Implementation |
|-----------|----------------|
| Whitespace | 24–32px section padding, 16px component gaps |
| Corners | `rounded-lg` (8px) default, `rounded-xl` (12px) cards, `rounded-2xl` modals |
| Glassmorphism | Light only: `backdrop-blur-sm bg-white/80 dark:bg-zinc-900/80` |
| Motion | Framer Motion: 200ms ease-out transitions, stagger children 50ms |
| Typography | Inter font, tight tracking on headings |
| Tables | Zebra-none, hover row highlight, sticky header |
| Loading | Skeleton loaders matching content shape — never spinners alone |

---

## Color Tokens

### Light Mode
```css
--background: 0 0% 100%;           /* #FFFFFF */
--foreground: 240 10% 3.9%;        /* #09090B */
--muted: 240 4.8% 95.9%;           /* #F4F4F5 */
--muted-foreground: 240 3.8% 46.1%;
--border: 240 5.9% 90%;            /* #E4E4E7 */
--primary: 240 5.9% 10%;           /* #18181B — overridable per client */
--primary-foreground: 0 0% 98%;
--accent: 240 4.8% 95.9%;
--destructive: 0 84.2% 60.2%;
--ring: 240 5.9% 10%;
--sidebar: 0 0% 98%;
--sidebar-foreground: 240 5.3% 26.1%;
--sidebar-accent: 240 4.8% 95.9%;
--success: 142 76% 36%;
--warning: 38 92% 50%;
```

### Dark Mode
```css
--background: 240 10% 3.9%;        /* #09090B */
--foreground: 0 0% 98%;
--muted: 240 3.7% 15.9%;
--muted-foreground: 240 5% 64.9%;
--border: 240 3.7% 15.9%;
--primary: 0 0% 98%;
--primary-foreground: 240 5.9% 10%;
--accent: 240 3.7% 15.9%;
--sidebar: 240 5.9% 10%;
```

### Client Brand Override
`PRIMARY_COLOR` env injects CSS variable `--brand` at runtime.

---

## Typography Scale

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| `text-xs` | 12px | 400 | Badges, timestamps |
| `text-sm` | 14px | 400 | Body, table cells |
| `text-base` | 16px | 400 | Default body |
| `text-lg` | 18px | 500 | Card titles |
| `text-xl` | 20px | 600 | Section headers |
| `text-2xl` | 24px | 600 | Page titles |
| `text-3xl` | 30px | 700 | Dashboard metrics |

Font: **Inter** (`font-sans`)

---

## Spacing Scale

Use Tailwind defaults. Key patterns:
- Page padding: `p-6 lg:p-8`
- Card padding: `p-5` or `p-6`
- Form field gap: `space-y-4`
- Button height: `h-9` (default), `h-10` (primary CTA)
- Input height: `h-9`
- Sidebar width: `w-64` expanded, `w-16` collapsed

---

## Component Catalog (Week 1)

### Layout
- `AppShell` — Sidebar + Navbar + main content area
- `Sidebar` — Collapsible nav with icons + labels
- `Navbar` — Search trigger, notifications, user menu, theme toggle
- `PageHeader` — Title, description, action buttons

### Navigation
- `CommandPalette` — Cmd+K global search & actions
- `Breadcrumbs` — Optional page hierarchy

### Data Display
- `DataTable` — Sortable, filterable, paginated table
- `Card` — Metric card, content card variants
- `Badge` — Status indicators (success, warning, destructive, outline)
- `Avatar` — User avatars with fallback initials
- `Skeleton` — Loading placeholders

### Forms
- `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`
- `FormField` — Label + input + error message wrapper
- `Button` — primary, secondary, ghost, destructive variants

### Feedback
- `Modal` / `Dialog` — Centered overlay with backdrop blur
- `Toast` — Bottom-right notifications
- `EmptyState` — Illustration + message + CTA

### Charts (Week 1 scaffold)
- `AreaChart`, `BarChart` — Recharts wrappers with design tokens

### Kanban (Week 1 scaffold)
- `KanbanBoard`, `KanbanColumn`, `KanbanCard` — Drag-ready structure

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `Cmd/Ctrl + /` | Show shortcuts help |
| `G then D` | Go to Dashboard |
| `G then L` | Go to Leads |
| `G then T` | Go to Tasks |
| `Esc` | Close modal / palette |

---

## Animation Guidelines

```tsx
// Page transitions
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }
};

// Stagger lists
const containerVariants = {
  animate: { transition: { staggerChildren: 0.05 } }
};

// Skeleton pulse
className="animate-pulse bg-muted rounded-md"
```

---

## Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| `sm` | 640px | Stack → row for simple layouts |
| `md` | 768px | Sidebar visible |
| `lg` | 1024px | Full layout |
| `xl` | 1280px | Wider content max-width |

Mobile: Sidebar becomes drawer overlay.

---

## Icon System

**Lucide React** — consistent 16px (inline) and 20px (nav) sizes.

---

## File Naming Conventions

```
components/
  ui/           # Primitives (button, input, etc.)
  layout/       # AppShell, Sidebar, Navbar
  data/         # DataTable, KanbanBoard
  feedback/     # Modal, Toast, Skeleton
  charts/       # Chart wrappers
```

'use client';

import { useState } from 'react';
import {
  PageHeader,
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  DataTable,
  SearchBar,
  KanbanBoard,
  EmptyState,
  Skeleton,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@crm/ui';
import { Inbox } from 'lucide-react';

const sampleData = [
  { id: '1', name: 'Jane Doe', email: 'jane@example.com', role: 'Admin', status: 'Active' },
  { id: '2', name: 'John Smith', email: 'john@example.com', role: 'Sales Rep', status: 'Active' },
  { id: '3', name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Inactive' },
];

const kanbanColumns = [
  {
    id: 'new',
    title: 'New',
    color: '#6366f1',
    items: [
      { id: '1', title: 'Solar panel inquiry', subtitle: 'Rajesh Kumar', badge: 'Hot', badgeVariant: 'destructive' as const },
      { id: '2', title: 'Coaching program', subtitle: 'Priya Sharma', badge: 'Warm', badgeVariant: 'warning' as const },
    ],
  },
  {
    id: 'contacted',
    title: 'Contacted',
    color: '#f59e0b',
    items: [{ id: '3', title: 'Real estate deal', subtitle: 'Amit Patel' }],
  },
  {
    id: 'qualified',
    title: 'Qualified',
    color: '#10b981',
    items: [{ id: '4', title: 'Travel package', subtitle: 'Sneha Reddy', badge: '₹3.1L', badgeVariant: 'success' as const }],
  },
];

export default function DesignSystemPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-10">
      <PageHeader
        title="Design System"
        description="UI foundation — components, tokens, and patterns for Week 1"
      />

      <section>
        <h2 className="text-lg font-semibold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Form Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
          <Input placeholder="Text input" />
          <SearchBar value={search} onChange={setSearch} placeholder="Search component..." />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Data Table</h2>
        <DataTable
          columns={[
            { key: 'name', header: 'Name', cell: (row) => row.name, sortable: true },
            { key: 'email', header: 'Email', cell: (row) => row.email },
            { key: 'role', header: 'Role', cell: (row) => row.role },
            {
              key: 'status',
              header: 'Status',
              cell: (row) => (
                <Badge variant={row.status === 'Active' ? 'success' : 'secondary'}>{row.status}</Badge>
              ),
            },
          ]}
          data={sampleData}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Kanban Board</h2>
        <KanbanBoard columns={kanbanColumns} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Skeleton Loaders</h2>
        <div className="space-y-3 max-w-md">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Modal</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open Modal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Example Modal</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Modals use light glassmorphism with backdrop blur and smooth animations.
            </p>
          </DialogContent>
        </Dialog>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Empty State</h2>
        <Card>
          <EmptyState
            icon={<Inbox className="h-10 w-10" />}
            title="No leads yet"
            description="Get started by creating your first lead or importing from CSV."
            action={{ label: 'Create Lead', onClick: () => {} }}
          />
        </Card>
      </section>
    </div>
  );
}

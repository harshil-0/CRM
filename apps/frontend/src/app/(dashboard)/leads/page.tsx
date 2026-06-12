'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, UserCheck, Trash2, Paperclip, Pencil } from 'lucide-react';
import {
  PageHeader,
  Button,
  DataTable,
  SearchBar,
  Badge,
  KanbanBoard,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@crm/ui';
import { useLeads, useConvertLead, useDeleteLead } from '@/hooks/use-leads';
import { CreateLeadDialog } from '@/components/create-lead-dialog';
import { EditLeadDialog } from '@/components/edit-lead-dialog';
import { ImportExportButtons } from '@/components/import-export-buttons';
import { AttachmentsPanel } from '@/components/attachments-panel';
import { LEAD_STATUS_LABELS, LEAD_STATUS_VARIANT } from '@/lib/crm-labels';
import type { Lead, LeadStatus } from '@crm/shared-types';
import { formatDate } from '@crm/utils';

const KANBAN_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [createOpen, setCreateOpen] = useState(false);
  const [attachmentsLead, setAttachmentsLead] = useState<Lead | null>(null);
  const [editLead, setEditLead] = useState<Lead | null>(null);

  const { data, isLoading } = useLeads({ search: search || undefined, status: statusFilter || undefined });
  const convertLead = useConvertLead();
  const deleteLead = useDeleteLead();

  const leads = data?.data ?? [];

  const kanbanColumns = KANBAN_STATUSES.map((status) => ({
    id: status,
    title: LEAD_STATUS_LABELS[status],
    color: status === 'new' ? '#6366f1' : status === 'qualified' ? '#10b981' : '#f59e0b',
    items: leads
      .filter((l) => l.status === status)
      .map((l) => ({
        id: l.id,
        title: l.title,
        subtitle: l.company ?? l.email ?? undefined,
        badge: l.score > 70 ? 'Hot' : undefined,
        badgeVariant: l.score > 70 ? ('destructive' as const) : undefined,
      })),
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <PageHeader
        title="Leads"
        description="Manage and track your sales leads"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <ImportExportButtons
              entity="leads"
              onImportComplete={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
            />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Lead
            </Button>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search leads..." className="sm:w-72" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | '')}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <div className="flex gap-1 ml-auto">
          <Button variant={view === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setView('table')}>
            Table
          </Button>
          <Button variant={view === 'kanban' ? 'default' : 'outline'} size="sm" onClick={() => setView('kanban')}>
            Kanban
          </Button>
        </div>
      </div>

      {view === 'kanban' ? (
        <KanbanBoard columns={kanbanColumns} />
      ) : (
        <DataTable<Lead>
          columns={[
            { key: 'title', header: 'Lead', sortable: true, cell: (row) => (
              <div>
                <p className="font-medium">{row.title}</p>
                {row.company && <p className="text-xs text-muted-foreground">{row.company}</p>}
              </div>
            )},
            { key: 'status', header: 'Status', cell: (row) => (
              <Badge variant={LEAD_STATUS_VARIANT[row.status]}>{LEAD_STATUS_LABELS[row.status]}</Badge>
            )},
            { key: 'source', header: 'Source', cell: (row) => row.source ?? '—' },
            { key: 'score', header: 'Score', cell: (row) => row.score },
            { key: 'assignedTo', header: 'Assigned', cell: (row) =>
              row.assignedTo ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}` : '—'
            },
            { key: 'createdAt', header: 'Created', cell: (row) => formatDate(row.createdAt) },
            { key: 'actions', header: '', cell: (row) => (
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="icon" title="Edit" onClick={() => setEditLead(row)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" title="Attachments" onClick={() => setAttachmentsLead(row)}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                {!row.convertedAt && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Convert to customer"
                    onClick={() => convertLead.mutate(row.id)}
                  >
                    <UserCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete"
                  onClick={() => deleteLead.mutate(row.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )},
          ]}
          data={leads}
          loading={isLoading}
          emptyMessage="No leads found. Create your first lead to get started."
        />
      )}

      <CreateLeadDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditLeadDialog lead={editLead} onOpenChange={(open) => !open && setEditLead(null)} />

      <Dialog open={!!attachmentsLead} onOpenChange={() => setAttachmentsLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Attachments — {attachmentsLead?.title}</DialogTitle>
          </DialogHeader>
          {attachmentsLead && (
            <AttachmentsPanel entity="leads" entityId={attachmentsLead.id} title="" />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

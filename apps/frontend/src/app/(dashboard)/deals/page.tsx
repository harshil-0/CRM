'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Pencil } from 'lucide-react';
import {
  PageHeader,
  Button,
  DataTable,
  SearchBar,
  KanbanBoard,
  Badge,
  Skeleton,
} from '@crm/ui';
import { useDeals, usePipelineBoard, useMoveDeal, useDeleteDeal } from '@/hooks/use-deals';
import { useDefaultPipeline } from '@/hooks/use-pipelines';
import { CreateDealDialog } from '@/components/create-deal-dialog';
import { EditDealDialog } from '@/components/edit-deal-dialog';
import { formatCompactCurrency, formatCurrency } from '@/lib/format';
import type { Deal } from '@crm/shared-types';
import { formatDate } from '@crm/utils';

export default function DealsPage() {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [createOpen, setCreateOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);

  const { data: pipeline, isLoading: pipelineLoading } = useDefaultPipeline();
  const { data: board, isLoading: boardLoading } = usePipelineBoard(pipeline?.id);
  const { data: dealsData, isLoading: tableLoading } = useDeals({ search: search || undefined });
  const moveDeal = useMoveDeal();
  const deleteDeal = useDeleteDeal();

  const isLoading = pipelineLoading || (view === 'kanban' ? boardLoading : tableLoading);
  const deals = dealsData?.data ?? [];

  const kanbanColumns = board
    ? board.pipeline.stages
        .sort((a, b) => a.order - b.order)
        .map((stage) => ({
          id: stage.id,
          title: stage.name,
          color: stage.color,
          items: board.deals
            .filter((d) => d.stage === stage.id)
            .map((d) => ({
              id: d.id,
              title: d.title,
              subtitle: d.customer?.name ?? d.notes ?? undefined,
              badge: formatCompactCurrency(d.value),
              badgeVariant: d.probability >= 70 ? ('success' as const) : d.probability >= 40 ? ('warning' as const) : ('secondary' as const),
            })),
        }))
    : [];

  const handleKanbanClick = (item: { id: string }, columnId: string) => {
    const deal = board?.deals.find((d) => d.id === item.id);
    if (!deal || deal.stage === columnId) return;
    moveDeal.mutate({ id: item.id, stage: columnId });
  };

  if (pipelineLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <PageHeader
        title="Deals"
        description={pipeline ? `${pipeline.name} — ${board?.deals.length ?? 0} active deals` : 'Manage your sales pipeline'}
        actions={
          pipeline && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Deal
            </Button>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {view === 'table' && (
          <SearchBar value={search} onChange={setSearch} placeholder="Search deals..." className="sm:w-72" />
        )}
        <div className="flex gap-1 ml-auto">
          <Button variant={view === 'kanban' ? 'default' : 'outline'} size="sm" onClick={() => setView('kanban')}>
            Pipeline
          </Button>
          <Button variant={view === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setView('table')}>
            Table
          </Button>
        </div>
      </div>

      {view === 'kanban' ? (
        boardLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <KanbanBoard columns={kanbanColumns} onItemClick={handleKanbanClick} />
        )
      ) : (
        <DataTable<Deal>
          columns={[
            { key: 'title', header: 'Deal', sortable: true, cell: (row) => (
              <div>
                <p className="font-medium">{row.title}</p>
                {row.customer && <p className="text-xs text-muted-foreground">{row.customer.name}</p>}
              </div>
            )},
            { key: 'value', header: 'Value', cell: (row) => (
              <span className="font-medium">{formatCurrency(row.value, row.currency)}</span>
            )},
            { key: 'stage', header: 'Stage', cell: (row) => {
              const stageName = pipeline?.stages.find((s) => s.id === row.stage)?.name ?? row.stage;
              return <Badge variant="secondary">{stageName}</Badge>;
            }},
            { key: 'probability', header: 'Probability', cell: (row) => `${row.probability}%` },
            { key: 'expectedCloseDate', header: 'Close Date', cell: (row) =>
              row.expectedCloseDate ? formatDate(row.expectedCloseDate) : '—'
            },
            { key: 'actions', header: '', cell: (row) => (
              <div className="flex gap-1 justify-end">
                <Button variant="ghost" size="icon" title="Edit" onClick={() => setEditDeal(row)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteDeal.mutate(row.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )},
          ]}
          data={deals}
          loading={isLoading}
          emptyMessage="No deals yet. Create your first deal to populate the pipeline."
        />
      )}

      {pipeline && (
        <>
          <CreateDealDialog open={createOpen} onOpenChange={setCreateOpen} pipeline={pipeline} />
          <EditDealDialog deal={editDeal} onOpenChange={(open) => !open && setEditDeal(null)} />
        </>
      )}
    </motion.div>
  );
}

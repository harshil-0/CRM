'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Trash2 } from 'lucide-react';
import {
  PageHeader,
  Button,
  DataTable,
  SearchBar,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@crm/ui';
import { useTasks, useUpdateTask, useDeleteTask } from '@/hooks/use-tasks';
import { useFollowUps, useCompleteFollowUp } from '@/hooks/use-follow-ups';
import { CreateTaskDialog } from '@/components/create-task-dialog';
import {
  TASK_STATUS_LABELS,
  TASK_STATUS_VARIANT,
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_VARIANT,
} from '@/lib/crm-labels';
import type { Task, TaskStatus } from '@crm/shared-types';
import { formatDateTime } from '@crm/utils';

export default function TasksPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useTasks({
    search: search || undefined,
    status: statusFilter || undefined,
  });
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: followUpsData } = useFollowUps({ status: 'pending' });
  const completeFollowUp = useCompleteFollowUp();

  const tasks = data?.data ?? [];
  const followUps = followUpsData?.data ?? [];

  const completeTask = (task: Task) => {
    updateTask.mutate({ id: task.id, data: { status: 'completed' } });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <PageHeader
        title="Tasks"
        description="Track follow-ups and action items"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." className="sm:w-72" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">All statuses</option>
          {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <DataTable<Task>
        columns={[
          { key: 'title', header: 'Task', sortable: true, cell: (row) => (
            <div>
              <p className={`font-medium ${row.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                {row.title}
              </p>
              {row.description && <p className="text-xs text-muted-foreground">{row.description}</p>}
            </div>
          )},
          { key: 'priority', header: 'Priority', cell: (row) => (
            <Badge variant={TASK_PRIORITY_VARIANT[row.priority]}>{TASK_PRIORITY_LABELS[row.priority]}</Badge>
          )},
          { key: 'status', header: 'Status', cell: (row) => (
            <Badge variant={TASK_STATUS_VARIANT[row.status]}>{TASK_STATUS_LABELS[row.status]}</Badge>
          )},
          { key: 'dueDate', header: 'Due', cell: (row) => row.dueDate ? formatDateTime(row.dueDate) : '—' },
          { key: 'assignedTo', header: 'Assigned', cell: (row) =>
            row.assignedTo ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}` : '—'
          },
          { key: 'actions', header: '', cell: (row) => (
            <div className="flex gap-1 justify-end">
              {row.status !== 'completed' && (
                <Button variant="ghost" size="icon" title="Mark complete" onClick={() => completeTask(row)}>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => deleteTask.mutate(row.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )},
        ]}
        data={tasks}
        loading={isLoading}
        emptyMessage="No tasks yet. Create a task to stay on top of follow-ups."
      />

      {followUps.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Upcoming Follow-ups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {followUps.map((fu) => (
                <div key={fu.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {fu.lead?.title ?? fu.customer?.name ?? 'Follow-up'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fu.notes ?? 'Scheduled follow-up'} · {formatDateTime(fu.scheduledAt)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => completeFollowUp.mutate(fu.id)}>
                    Complete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} />
    </motion.div>
  );
}

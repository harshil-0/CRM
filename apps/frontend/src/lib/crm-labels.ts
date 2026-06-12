import type { LeadStatus, TaskStatus, TaskPriority } from '@crm/shared-types';

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export const LEAD_STATUS_VARIANT: Record<LeadStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  new: 'default',
  contacted: 'secondary',
  qualified: 'warning',
  proposal: 'warning',
  negotiation: 'warning',
  won: 'success',
  lost: 'destructive',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const TASK_PRIORITY_VARIANT: Record<TaskPriority, 'secondary' | 'warning' | 'destructive' | 'default'> = {
  low: 'secondary',
  medium: 'default',
  high: 'warning',
  urgent: 'destructive',
};

export const TASK_STATUS_VARIANT: Record<TaskStatus, 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pending: 'secondary',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'destructive',
};

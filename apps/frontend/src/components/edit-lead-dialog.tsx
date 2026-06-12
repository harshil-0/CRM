'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
} from '@crm/ui';
import { useUpdateLead, useAssignLead } from '@/hooks/use-leads';
import { UserSelect } from '@/components/user-select';
import { LEAD_STATUS_LABELS } from '@/lib/crm-labels';
import type { Lead, LeadStatus } from '@crm/shared-types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  status: z.string(),
  score: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
  assignedToId: z.string(),
});

type FormData = z.infer<typeof schema>;

interface EditLeadDialogProps {
  lead: Lead | null;
  onOpenChange: (open: boolean) => void;
}

export function EditLeadDialog({ lead, onOpenChange }: EditLeadDialogProps) {
  const updateLead = useUpdateLead();
  const assignLead = useAssignLead();
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const assignedToId = watch('assignedToId');

  useEffect(() => {
    if (lead) {
      reset({
        title: lead.title,
        email: lead.email ?? '',
        phone: lead.phone ?? '',
        company: lead.company ?? '',
        source: lead.source ?? '',
        status: lead.status,
        score: lead.score,
        notes: lead.notes ?? '',
        assignedToId: lead.assignedTo?.id ?? '',
      });
    }
  }, [lead, reset]);

  const onSubmit = async (data: FormData) => {
    if (!lead) return;
    setError('');
    try {
      await updateLead.mutateAsync({
        id: lead.id,
        data: {
          title: data.title,
          email: data.email || undefined,
          phone: data.phone || undefined,
          company: data.company || undefined,
          source: data.source || undefined,
          status: data.status as LeadStatus,
          score: data.score,
          notes: data.notes || undefined,
        },
      });

      const currentAssignee = lead.assignedTo?.id ?? '';
      if (data.assignedToId && data.assignedToId !== currentAssignee) {
        await assignLead.mutateAsync({ id: lead.id, assignedToId: data.assignedToId });
      }

      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead');
    }
  };

  const pending = updateLead.isPending || assignLead.isPending;

  return (
    <Dialog open={!!lead} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" {...register('email')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input {...register('phone')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input {...register('company')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Input {...register('source')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select
                className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                {...register('status')}
              >
                {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Score</label>
              <Input type="number" min={0} max={100} {...register('score')} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned to</label>
            <UserSelect
              value={assignedToId}
              onChange={(id) => setValue('assignedToId', id, { shouldDirty: true })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Input {...register('notes')} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

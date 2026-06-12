'use client';

import { useState } from 'react';
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
import { useCreateFollowUp } from '@/hooks/use-follow-ups';
import { useLeads } from '@/hooks/use-leads';
import { useCustomers } from '@/hooks/use-customers';

const schema = z.object({
  scheduledAt: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  leadId: z.string().optional(),
  customerId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateFollowUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateFollowUpDialog({ open, onOpenChange }: CreateFollowUpDialogProps) {
  const createFollowUp = useCreateFollowUp();
  const { data: leadsData } = useLeads({ limit: 100 });
  const { data: customersData } = useCustomers({ limit: 100 });
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const leads = leadsData?.data ?? [];
  const customers = customersData?.data ?? [];

  const onSubmit = async (data: FormData) => {
    setError('');
    if (!data.leadId && !data.customerId) {
      setError('Select a lead or customer');
      return;
    }
    try {
      await createFollowUp.mutateAsync({
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        notes: data.notes || undefined,
        leadId: data.leadId || undefined,
        customerId: data.customerId || undefined,
      });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create follow-up');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">When *</label>
            <Input type="datetime-local" {...register('scheduledAt')} />
            {errors.scheduledAt && <p className="text-xs text-destructive">{errors.scheduledAt.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lead</label>
            <select
              className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              {...register('leadId')}
            >
              <option value="">— None —</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>{lead.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer</label>
            <select
              className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              {...register('customerId')}
            >
              <option value="">— None —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Input placeholder="Call to discuss proposal..." {...register('notes')} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createFollowUp.isPending}>
              {createFollowUp.isPending ? 'Scheduling...' : 'Schedule'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
import { useCreateLead, useAssignLead } from '@/hooks/use-leads';
import { UserSelect } from '@/components/user-select';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  assignedToId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLeadDialog({ open, onOpenChange }: CreateLeadDialogProps) {
  const createLead = useCreateLead();
  const assignLead = useAssignLead();
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const assignedToId = watch('assignedToId') ?? '';

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const lead = await createLead.mutateAsync({
        title: data.title,
        email: data.email || undefined,
        phone: data.phone || undefined,
        company: data.company || undefined,
        source: data.source || undefined,
      });
      if (data.assignedToId) {
        await assignLead.mutateAsync({ id: lead.id, assignedToId: data.assignedToId });
      }
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input placeholder="Lead name or opportunity" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="email@example.com" {...register('email')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input placeholder="+91 98765 43210" {...register('phone')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company</label>
              <Input placeholder="Company name" {...register('company')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Input placeholder="Website, Referral..." {...register('source')} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to</label>
            <UserSelect
              value={assignedToId}
              onChange={(id) => setValue('assignedToId', id)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createLead.isPending || assignLead.isPending}>
              {createLead.isPending || assignLead.isPending ? 'Creating...' : 'Create Lead'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

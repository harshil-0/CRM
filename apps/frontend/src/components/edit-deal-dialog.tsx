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
import { useUpdateDeal } from '@/hooks/use-deals';
import { useDefaultPipeline } from '@/hooks/use-pipelines';
import type { Deal } from '@crm/shared-types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.coerce.number().min(0),
  probability: z.coerce.number().min(0).max(100),
  stage: z.string().min(1),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EditDealDialogProps {
  deal: Deal | null;
  onOpenChange: (open: boolean) => void;
}

export function EditDealDialog({ deal, onOpenChange }: EditDealDialogProps) {
  const updateDeal = useUpdateDeal();
  const { data: pipeline } = useDefaultPipeline();
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (deal) {
      reset({
        title: deal.title,
        value: deal.value,
        probability: deal.probability,
        stage: deal.stage,
        notes: deal.notes ?? '',
      });
    }
  }, [deal, reset]);

  const onSubmit = async (data: FormData) => {
    if (!deal) return;
    setError('');
    try {
      await updateDeal.mutateAsync({
        id: deal.id,
        data: {
          title: data.title,
          value: data.value,
          probability: data.probability,
          stage: data.stage,
          notes: data.notes || undefined,
        },
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deal');
    }
  };

  return (
    <Dialog open={!!deal} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input type="number" {...register('value')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Probability (%)</label>
              <Input type="number" min={0} max={100} {...register('probability')} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Stage</label>
            <select
              className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
              {...register('stage')}
            >
              {pipeline?.stages
                .sort((a, b) => a.order - b.order)
                .map((stage) => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Input {...register('notes')} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateDeal.isPending}>
              {updateDeal.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

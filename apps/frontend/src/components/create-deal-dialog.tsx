'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input } from '@crm/ui';
import { useCreateDeal } from '@/hooks/use-deals';
import type { Pipeline } from '@crm/shared-types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.coerce.number().min(0),
  stage: z.string().min(1),
  probability: z.coerce.number().min(0).max(100).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipeline: Pipeline;
}

export function CreateDealDialog({ open, onOpenChange, pipeline }: CreateDealDialogProps) {
  const createDeal = useCreateDeal();
  const [error, setError] = useState('');
  const defaultStage = pipeline.stages[0]?.id ?? '';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { stage: defaultStage, probability: 20 },
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await createDeal.mutateAsync({
        title: data.title,
        value: data.value,
        stage: data.stage,
        pipelineId: pipeline.id,
        probability: data.probability,
        notes: data.notes,
      });
      reset();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input placeholder="Deal name" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Value (INR) *</label>
              <Input type="number" placeholder="100000" {...register('value')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Probability %</label>
              <Input type="number" {...register('probability')} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Stage</label>
            <select className="flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" {...register('stage')}>
              {pipeline.stages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes</label>
            <Input placeholder="Additional details..." {...register('notes')} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createDeal.isPending}>
              {createDeal.isPending ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

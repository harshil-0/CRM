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
import { useUpdateCustomer } from '@/hooks/use-customers';
import { UserSelect } from '@/components/user-select';
import type { Customer } from '@crm/shared-types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  tags: z.string().optional(),
  assignedToId: z.string(),
});

type FormData = z.infer<typeof schema>;

interface EditCustomerDialogProps {
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
}

export function EditCustomerDialog({ customer, onOpenChange }: EditCustomerDialogProps) {
  const updateCustomer = useUpdateCustomer();
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const assignedToId = watch('assignedToId');

  useEffect(() => {
    if (customer) {
      reset({
        name: customer.name,
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        company: customer.company ?? '',
        address: customer.address ?? '',
        tags: customer.tags.join('; '),
        assignedToId: customer.assignedTo?.id ?? '',
      });
    }
  }, [customer, reset]);

  const onSubmit = async (data: FormData) => {
    if (!customer) return;
    setError('');
    try {
      await updateCustomer.mutateAsync({
        id: customer.id,
        data: {
          name: data.name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          company: data.company || undefined,
          address: data.address || undefined,
          tags: data.tags
            ? data.tags.split(';').map((t) => t.trim()).filter(Boolean)
            : [],
          assignedToId: data.assignedToId || undefined,
        },
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
    }
  };

  return (
    <Dialog open={!!customer} onOpenChange={(open) => !open && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name *</label>
            <Input {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Company</label>
            <Input {...register('company')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input {...register('address')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <Input placeholder="vip; enterprise (semicolon-separated)" {...register('tags')} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned to</label>
            <UserSelect
              value={assignedToId}
              onChange={(id) => setValue('assignedToId', id, { shouldDirty: true })}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateCustomer.isPending}>
              {updateCustomer.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

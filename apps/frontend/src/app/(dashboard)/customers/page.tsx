'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Trash2, Paperclip } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  PageHeader,
  Button,
  DataTable,
  SearchBar,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
} from '@crm/ui';
import { useCustomers, useCreateCustomer, useDeleteCustomer } from '@/hooks/use-customers';
import { ImportExportButtons } from '@/components/import-export-buttons';
import { AttachmentsPanel } from '@/components/attachments-panel';
import type { Customer } from '@crm/shared-types';
import { formatDate } from '@crm/utils';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [attachmentsCustomer, setAttachmentsCustomer] = useState<Customer | null>(null);
  const { data, isLoading } = useCustomers({ search: search || undefined });
  const createCustomer = useCreateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const customers = data?.data ?? [];

  const onSubmit = async (formData: FormData) => {
    await createCustomer.mutateAsync({
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      company: formData.company || undefined,
    });
    reset();
    setCreateOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <PageHeader
        title="Customers"
        description="Manage your customer relationships"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <ImportExportButtons
              entity="customers"
              onImportComplete={() => queryClient.invalidateQueries({ queryKey: ['customers'] })}
            />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Customer
            </Button>
          </div>
        }
      />

      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search customers..." className="sm:w-72" />
      </div>

      <DataTable<Customer>
        columns={[
          { key: 'name', header: 'Customer', sortable: true, cell: (row) => (
            <div>
              <p className="font-medium">{row.name}</p>
              {row.company && <p className="text-xs text-muted-foreground">{row.company}</p>}
            </div>
          )},
          { key: 'email', header: 'Email', cell: (row) => row.email ?? '—' },
          { key: 'phone', header: 'Phone', cell: (row) => row.phone ?? '—' },
          { key: 'tags', header: 'Tags', cell: (row) => (
            <div className="flex gap-1 flex-wrap">
              {row.tags.length ? row.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>) : '—'}
            </div>
          )},
          { key: 'assignedTo', header: 'Assigned', cell: (row) =>
            row.assignedTo ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}` : '—'
          },
          { key: 'createdAt', header: 'Since', cell: (row) => formatDate(row.createdAt) },
          { key: 'actions', header: '', cell: (row) => (
            <div className="flex gap-1 justify-end">
              <Button variant="ghost" size="icon" onClick={() => setAttachmentsCustomer(row)}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => deleteCustomer.mutate(row.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )},
        ]}
        data={customers}
        loading={isLoading}
        emptyMessage="No customers yet. Convert a lead or add one manually."
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Customer</DialogTitle>
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
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createCustomer.isPending}>Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!attachmentsCustomer} onOpenChange={() => setAttachmentsCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Attachments — {attachmentsCustomer?.name}</DialogTitle>
          </DialogHeader>
          {attachmentsCustomer && (
            <AttachmentsPanel entity="customers" entityId={attachmentsCustomer.id} title="" />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, UserX, Pencil } from 'lucide-react';
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
import { useUsers, useUpdateUser, useDeactivateUser } from '@/hooks/use-users';
import { useRoles } from '@/hooks/use-roles';
import { CreateUserDialog } from '@/components/create-user-dialog';
import { useAuth } from '@/providers/auth-provider';
import type { UserRecord } from '@crm/shared-types';
import { formatDate } from '@crm/utils';

export default function TeamPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);

  const canManage = currentUser?.permissions.includes('users:read');
  const canWrite = currentUser?.permissions.includes('users:write');

  const { data, isLoading } = useUsers({ search: search || undefined });
  const { data: roles } = useRoles();
  const updateUser = useUpdateUser();
  const deactivateUser = useDeactivateUser();

  if (!canManage) {
    return (
      <div className="rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">You do not have permission to manage team members.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/settings')}>
          Back to Settings
        </Button>
      </div>
    );
  }

  const users = data?.data ?? [];

  const handleRoleChange = async (user: UserRecord, roleId: string) => {
    if (!canWrite || roleId === user.role.id) return;
    await updateUser.mutateAsync({ id: user.id, data: { roleId } });
  };

  const handleToggleActive = async (user: UserRecord) => {
    if (!canWrite || user.id === currentUser?.id) return;
    if (user.isActive) {
      await deactivateUser.mutateAsync(user.id);
    } else {
      await updateUser.mutateAsync({ id: user.id, data: { isActive: true } });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
      <PageHeader
        title="Team"
        description="Manage users, roles, and access"
        actions={
          canWrite ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search team..." className="sm:w-72" />
      </div>

      <DataTable<UserRecord>
        columns={[
          {
            key: 'name',
            header: 'Member',
            cell: (row) => (
              <div>
                <p className="font-medium">{row.firstName} {row.lastName}</p>
                <p className="text-xs text-muted-foreground">{row.email}</p>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Role',
            cell: (row) =>
              canWrite ? (
                <select
                  value={row.role.id}
                  onChange={(e) => handleRoleChange(row, e.target.value)}
                  className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                  disabled={row.id === currentUser?.id}
                >
                  {(roles ?? []).map((role) => (
                    <option key={role.id} value={role.id}>{role.displayName}</option>
                  ))}
                </select>
              ) : (
                <Badge variant="outline">{row.role.displayName}</Badge>
              ),
          },
          {
            key: 'status',
            header: 'Status',
            cell: (row) => (
              <Badge variant={row.isActive ? 'default' : 'secondary'}>
                {row.isActive ? 'Active' : 'Inactive'}
              </Badge>
            ),
          },
          {
            key: 'lastLoginAt',
            header: 'Last login',
            cell: (row) => (row.lastLoginAt ? formatDate(row.lastLoginAt) : 'Never'),
          },
          {
            key: 'actions',
            header: '',
            cell: (row) => (
              <div className="flex gap-1 justify-end">
                {canWrite && (
                  <>
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => setEditUser(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {row.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title={row.isActive ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggleActive(row)}
                      >
                        <UserX className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            ),
          },
        ]}
        data={users}
        loading={isLoading}
        emptyMessage="No team members found."
      />

      {canWrite && <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />}

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editUser?.firstName} {editUser?.lastName}</DialogTitle>
          </DialogHeader>
          {editUser && (
            <EditUserForm
              user={editUser}
              onSave={async (data) => {
                await updateUser.mutateAsync({ id: editUser.id, data });
                setEditUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function EditUserForm({
  user,
  onSave,
}: {
  user: UserRecord;
  onSave: (data: { firstName: string; lastName: string; phone?: string }) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [saving, setSaving] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
          await onSave({ firstName, lastName, phone: phone || undefined });
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">First name</label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Last name</label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Phone</label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </div>
    </form>
  );
}

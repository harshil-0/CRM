'use client';

import { useAssignableUsers } from '@/hooks/use-users';

interface UserSelectProps {
  value: string;
  onChange: (userId: string) => void;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function UserSelect({
  value,
  onChange,
  allowEmpty = true,
  emptyLabel = 'Unassigned',
  className,
  disabled,
}: UserSelectProps) {
  const { data: users, isLoading } = useAssignableUsers();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading}
      className={className ?? 'flex h-9 w-full rounded-lg border border-border bg-background px-3 text-sm'}
    >
      {allowEmpty && <option value="">{emptyLabel}</option>}
      {(users ?? []).map((user) => (
        <option key={user.id} value={user.id}>
          {user.firstName} {user.lastName} ({user.email})
        </option>
      ))}
    </select>
  );
}

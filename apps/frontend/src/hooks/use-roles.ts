import { useQuery } from '@tanstack/react-query';
import type { Role } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get<Role[]>('/roles'),
    staleTime: 5 * 60_000,
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserRecord, UserSummary, CreateUserRequest, UpdateUserRequest } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useUsers(query: { search?: string; roleId?: string; isActive?: boolean } = {}) {
  return useQuery({
    queryKey: ['users', query],
    queryFn: () =>
      api.getPaginated<UserRecord>('/users', {
        ...query,
        isActive: query.isActive === undefined ? undefined : query.isActive ? 'true' : 'false',
      }),
  });
}

export function useAssignableUsers() {
  return useQuery({
    queryKey: ['users', 'assignable'],
    queryFn: () => api.get<UserSummary[]>('/users/assignable'),
    staleTime: 60_000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => api.post<UserRecord>('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'assignable'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      api.patch<UserRecord>(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'assignable'] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<UserRecord>(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'assignable'] });
    },
  });
}

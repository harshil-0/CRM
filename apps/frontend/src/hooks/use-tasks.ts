import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskQuery } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useTasks(query: TaskQuery = {}) {
  return useQuery({
    queryKey: ['tasks', query],
    queryFn: () => api.getPaginated<Task>('/tasks', query as Record<string, string | number | undefined>),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => api.post<Task>('/tasks', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      api.patch<Task>(`/tasks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

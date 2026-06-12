import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FollowUp, CreateFollowUpRequest, FollowUpQuery } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useFollowUps(query: FollowUpQuery = {}) {
  return useQuery({
    queryKey: ['follow-ups', query],
    queryFn: () =>
      api.getPaginated<FollowUp>('/follow-ups', query as Record<string, string | number | undefined>),
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFollowUpRequest) => api.post<FollowUp>('/follow-ups', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['follow-ups'] }),
  });
}

export function useCompleteFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<FollowUp>(`/follow-ups/${id}/complete`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['follow-ups'] }),
  });
}

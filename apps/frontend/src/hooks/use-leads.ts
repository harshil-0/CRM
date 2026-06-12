import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Lead, CreateLeadRequest, UpdateLeadRequest, LeadQuery } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useLeads(query: LeadQuery = {}) {
  return useQuery({
    queryKey: ['leads', query],
    queryFn: () => api.getPaginated<Lead>('/leads', query as Record<string, string | number | undefined>),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => api.post<Lead>('/leads', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      api.patch<Lead>(`/leads/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useConvertLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/leads/${id}/convert`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

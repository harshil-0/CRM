import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Deal, CreateDealRequest, UpdateDealRequest, DealQuery, PipelineBoard } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useDeals(query: DealQuery = {}) {
  return useQuery({
    queryKey: ['deals', query],
    queryFn: () => api.getPaginated<Deal>('/deals', query as Record<string, string | number | undefined>),
  });
}

export function usePipelineBoard(pipelineId?: string) {
  return useQuery({
    queryKey: ['deals', 'pipeline', pipelineId],
    queryFn: () => api.get<PipelineBoard>(`/deals/pipeline/${pipelineId}`),
    enabled: !!pipelineId,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDealRequest) => api.post<Deal>('/deals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useMoveDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      api.post<Deal>(`/deals/${id}/move`, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDealRequest }) =>
      api.patch<Deal>(`/deals/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

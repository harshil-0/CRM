import { useQuery } from '@tanstack/react-query';
import type { Pipeline } from '@crm/shared-types';
import { api } from '@/lib/api';

export function usePipelines() {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: () => api.get<Pipeline[]>('/pipelines'),
  });
}

export function useDefaultPipeline() {
  return useQuery({
    queryKey: ['pipelines', 'default'],
    queryFn: () => api.get<Pipeline>('/pipelines/default'),
  });
}

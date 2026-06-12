import { useMutation, useQuery } from '@tanstack/react-query';
import type { ImportEntity, ImportJob } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useImportJob(jobId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['import-job', jobId],
    queryFn: () => api.get<ImportJob>(`/import/jobs/${jobId}`),
    enabled: !!jobId && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'pending' || status === 'processing' ? 2000 : false;
    },
  });
}

export function useImportEntity(entity: ImportEntity) {
  return useMutation({
    mutationFn: (file: File) => api.upload<ImportJob>(`/import/${entity}`, file),
  });
}

export function useExportEntity(entity: ImportEntity) {
  return useMutation({
    mutationFn: () => api.download(`/export/${entity}`, `${entity}-export.csv`),
  });
}

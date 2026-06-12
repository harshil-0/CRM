import { useQuery } from '@tanstack/react-query';
import type { ReportsSummary, DealsReport, ActivityReport } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useReportsSummary() {
  return useQuery({
    queryKey: ['reports', 'summary'],
    queryFn: () => api.get<ReportsSummary>('/reports/summary'),
  });
}

export function useDealsReport() {
  return useQuery({
    queryKey: ['reports', 'deals'],
    queryFn: () => api.get<DealsReport>('/reports/deals'),
  });
}

export function useActivityReport() {
  return useQuery({
    queryKey: ['reports', 'activity'],
    queryFn: () => api.get<ActivityReport>('/reports/activity'),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Customer, CreateCustomerRequest, UpdateCustomerRequest, CustomerQuery } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useCustomers(query: CustomerQuery = {}) {
  return useQuery({
    queryKey: ['customers', query],
    queryFn: () => api.getPaginated<Customer>('/customers', query as Record<string, string | number | undefined>),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) => api.post<Customer>('/customers', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      api.patch<Customer>(`/customers/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

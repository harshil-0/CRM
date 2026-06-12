import { useQuery, useMutation } from '@tanstack/react-query';
import type { ClientConfig, UpdateProfileRequest, UserProfile } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useClientConfig() {
  return useQuery({
    queryKey: ['settings', 'client'],
    queryFn: () => api.get<ClientConfig>('/settings/client'),
  });
}

export function useUpdateProfile(onSuccess?: (user: UserProfile) => void) {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => api.patch<UserProfile>('/settings/profile', data),
    onSuccess: (user) => onSuccess?.(user),
  });
}

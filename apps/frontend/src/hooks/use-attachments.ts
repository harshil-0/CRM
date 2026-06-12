import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Attachment, AttachmentEntity } from '@crm/shared-types';
import { api } from '@/lib/api';

export function useAttachments(entity: AttachmentEntity, entityId: string) {
  return useQuery({
    queryKey: ['attachments', entity, entityId],
    queryFn: () => api.get<Attachment[]>(`/attachments?entity=${entity}&entityId=${entityId}`),
    enabled: !!entityId,
  });
}

export function useUploadAttachment(entity: AttachmentEntity, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) =>
      api.upload<Attachment>('/attachments', file, { entity, entityId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', entity, entityId] });
    },
  });
}

export function useDeleteAttachment(entity: AttachmentEntity, entityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/attachments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', entity, entityId] });
    },
  });
}

export function downloadAttachment(id: string, filename: string) {
  return api.download(`/attachments/${id}/download`, filename);
}

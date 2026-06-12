'use client';

import { useRef } from 'react';
import { Paperclip, Download, Trash2, Upload, Loader2 } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Skeleton } from '@crm/ui';
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  downloadAttachment,
} from '@/hooks/use-attachments';
import type { AttachmentEntity } from '@crm/shared-types';
import { formatDateTime } from '@crm/utils';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentsPanelProps {
  entity: AttachmentEntity;
  entityId: string;
  title?: string;
}

export function AttachmentsPanel({ entity, entityId, title = 'Attachments' }: AttachmentsPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: attachments, isLoading } = useAttachments(entity, entityId);
  const upload = useUploadAttachment(entity, entityId);
  const deleteAttachment = useDeleteAttachment(entity, entityId);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await upload.mutateAsync(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Paperclip className="h-4 w-4" />
          {title}
        </CardTitle>
        <div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={upload.isPending}
          >
            {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : !attachments?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">No attachments yet</p>
        ) : (
          <div className="space-y-2">
            {attachments.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 hover:bg-muted/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} · {formatDateTime(file.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadAttachment(file.id, file.originalName)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAttachment.mutate(file.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

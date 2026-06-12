'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Download, Loader2 } from 'lucide-react';
import { Button } from '@crm/ui';
import { useImportEntity, useExportEntity, useImportJob } from '@/hooks/use-import-export';
import type { ImportEntity } from '@crm/shared-types';

interface ImportExportButtonsProps {
  entity: ImportEntity;
  onImportComplete?: () => void;
}

export function ImportExportButtons({ entity, onImportComplete }: ImportExportButtonsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const importEntity = useImportEntity(entity);
  const exportEntity = useExportEntity(entity);
  const { data: job } = useImportJob(jobId);
  const completedRef = useRef(false);

  useEffect(() => {
    if (!job || completedRef.current) return;
    if (job.status === 'completed' || job.status === 'failed') {
      completedRef.current = true;
      onImportComplete?.();
      const timer = setTimeout(() => {
        setJobId(null);
        completedRef.current = false;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [job, onImportComplete]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await importEntity.mutateAsync(file);
      setJobId(result.id);
    } catch {
      // handled by mutation
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  const isImporting = importEntity.isPending || job?.status === 'pending' || job?.status === 'processing';

  return (
    <div className="flex items-center gap-2">
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={isImporting}>
        {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        Import CSV
      </Button>
      <Button variant="outline" size="sm" onClick={() => exportEntity.mutate()} disabled={exportEntity.isPending}>
        <Download className="h-4 w-4" />
        Export
      </Button>
      {job && (job.status === 'completed' || job.status === 'failed') && (
        <span className="text-xs text-muted-foreground">
          {job.successCount} imported · {job.errorCount} errors
        </span>
      )}
    </div>
  );
}

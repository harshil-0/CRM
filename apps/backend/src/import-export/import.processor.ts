import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ImportExportService } from './import-export.service';

@Processor('import')
export class ImportProcessor extends WorkerHost {
  constructor(private importExportService: ImportExportService) {
    super();
  }

  async process(job: Job<{ jobId: string; entity: 'leads' | 'customers'; rows: string[][]; userId: string }>) {
    const { jobId, entity, rows, userId } = job.data;
    return this.importExportService.processImport(jobId, entity, rows, userId);
  }
}

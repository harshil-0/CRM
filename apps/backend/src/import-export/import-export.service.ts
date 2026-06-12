import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { parseCsv, toCsv } from '../common/utils/csv.util';

const EXPORTABLE_ENTITIES = ['leads', 'customers'] as const;
type ExportEntity = (typeof EXPORTABLE_ENTITIES)[number];

@Injectable()
export class ImportExportService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
    @InjectQueue('import') private importQueue: Queue,
  ) {}

  async exportEntity(entity: ExportEntity) {
    if (entity === 'leads') {
      const leads = await this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
      const headers = ['title', 'email', 'phone', 'company', 'source', 'status', 'score', 'notes'];
      const rows = leads.map((l) => [
        l.title,
        l.email ?? '',
        l.phone ?? '',
        l.company ?? '',
        l.source ?? '',
        l.status,
        String(l.score),
        l.notes ?? '',
      ]);
      return { filename: 'leads-export.csv', content: toCsv(headers, rows) };
    }

    if (entity === 'customers') {
      const customers = await this.prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
      const headers = ['name', 'email', 'phone', 'company', 'address', 'tags'];
      const rows = customers.map((c) => [
        c.name,
        c.email ?? '',
        c.phone ?? '',
        c.company ?? '',
        c.address ?? '',
        c.tags.join(';'),
      ]);
      return { filename: 'customers-export.csv', content: toCsv(headers, rows) };
    }

    throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid export entity' });
  }

  async startImport(entity: ExportEntity, file: Express.Multer.File, userId: string) {
    if (!file) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'No file provided' });

    const content = file.buffer.toString('utf-8');
    const rows = parseCsv(content);
    if (rows.length < 2) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'CSV must have a header row and at least one data row' });
    }

    const job = await this.prisma.importJob.create({
      data: {
        entity,
        filename: file.originalname,
        status: 'pending',
        totalRows: rows.length - 1,
        createdById: userId,
      },
    });

    await this.importQueue.add('process-import', {
      jobId: job.id,
      entity,
      rows,
      userId,
    });

    return {
      id: job.id,
      entity: job.entity,
      status: job.status,
      filename: job.filename,
      totalRows: job.totalRows,
      createdAt: job.createdAt.toISOString(),
    };
  }

  async getImportJob(id: string, userId: string) {
    const job = await this.prisma.importJob.findFirst({
      where: { id, createdById: userId },
    });
    if (!job) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Import job not found' });

    return {
      id: job.id,
      entity: job.entity,
      status: job.status,
      filename: job.filename,
      totalRows: job.totalRows,
      successCount: job.successCount,
      errorCount: job.errorCount,
      errors: job.errors as { row: number; message: string }[] | null,
      createdAt: job.createdAt.toISOString(),
      completedAt: job.completedAt?.toISOString() ?? null,
    };
  }

  async processImport(jobId: string, entity: ExportEntity, rows: string[][], userId: string) {
    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { status: 'processing' },
    });

    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const dataRows = rows.slice(1);
    const errors: { row: number; message: string }[] = [];
    let successCount = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        record[h] = row[idx] ?? '';
      });

      try {
        if (entity === 'leads') {
          if (!record.title) throw new Error('title is required');
          await this.prisma.lead.create({
            data: {
              title: record.title,
              email: record.email || undefined,
              phone: record.phone || undefined,
              company: record.company || undefined,
              source: record.source || undefined,
              status: record.status || 'new',
              score: record.score ? parseInt(record.score, 10) : 0,
              notes: record.notes || undefined,
              createdById: userId,
            },
          });
        } else if (entity === 'customers') {
          if (!record.name) throw new Error('name is required');
          await this.prisma.customer.create({
            data: {
              name: record.name,
              email: record.email || undefined,
              phone: record.phone || undefined,
              company: record.company || undefined,
              address: record.address || undefined,
              tags: record.tags ? record.tags.split(';').filter(Boolean) : [],
              createdById: userId,
            },
          });
        }
        successCount++;
      } catch (err) {
        errors.push({
          row: i + 2,
          message: err instanceof Error ? err.message : 'Import failed',
        });
      }
    }

    const status = errors.length === dataRows.length ? 'failed' : 'completed';

    await this.prisma.importJob.update({
      where: { id: jobId },
      data: {
        status,
        successCount,
        errorCount: errors.length,
        errors: errors as unknown as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });

    await this.auditService.log({
      userId,
      action: 'CREATE',
      entity: 'import_jobs',
      entityId: jobId,
      newValues: { entity, successCount, errorCount: errors.length },
    });

    await this.notificationsService.create({
      userId,
      type: status === 'completed' ? 'success' : 'warning',
      title: 'Import complete',
      message: `Imported ${successCount} ${entity}. ${errors.length} errors.`,
      link: entity === 'leads' ? '/leads' : '/customers',
    });

    return { successCount, errorCount: errors.length, errors };
  }
}

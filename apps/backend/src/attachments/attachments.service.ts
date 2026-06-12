import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { formatUserSummary } from '../common/utils/user-summary';

const ALLOWED_ENTITIES = ['leads', 'customers', 'deals', 'tasks'] as const;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/csv',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

@Injectable()
export class AttachmentsService {
  private uploadDir: string;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {
    this.uploadDir = this.config.get<string>('UPLOAD_DIR', './uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async findByEntity(entity: string, entityId: string) {
    if (!ALLOWED_ENTITIES.includes(entity as (typeof ALLOWED_ENTITIES)[number])) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid entity type' });
    }

    const attachments = await this.prisma.attachment.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
      include: { uploadedBy: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } } },
    });

    return attachments.map((a) => ({
      id: a.id,
      filename: a.filename,
      originalName: a.originalName,
      mimeType: a.mimeType,
      size: a.size,
      entity: a.entity,
      entityId: a.entityId,
      uploadedBy: formatUserSummary(a.uploadedBy),
      createdAt: a.createdAt.toISOString(),
    }));
  }

  async upload(
    file: Express.Multer.File,
    entity: string,
    entityId: string,
    userId: string,
  ) {
    if (!file) throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'No file provided' });
    if (!ALLOWED_ENTITIES.includes(entity as (typeof ALLOWED_ENTITIES)[number])) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid entity type' });
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'File exceeds 10MB limit' });
    }
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'File type not allowed' });
    }

    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    const entityDir = path.join(this.uploadDir, entity);
    if (!fs.existsSync(entityDir)) fs.mkdirSync(entityDir, { recursive: true });

    const filePath = path.join(entityDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    const attachment = await this.prisma.attachment.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        entity,
        entityId,
        uploadedById: userId,
      },
      include: { uploadedBy: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } } },
    });

    await this.auditService.log({
      userId,
      action: 'CREATE',
      entity: 'attachments',
      entityId: attachment.id,
      newValues: { originalName: file.originalname, linkedEntity: entity, linkedEntityId: entityId },
    });

    return {
      id: attachment.id,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
      entity: attachment.entity,
      entityId: attachment.entityId,
      uploadedBy: formatUserSummary(attachment.uploadedBy),
      createdAt: attachment.createdAt.toISOString(),
    };
  }

  async getFile(id: string, _userId: string) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
    if (!attachment) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Attachment not found' });
    if (!fs.existsSync(attachment.path)) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: 'File not found on disk' });
    }

    return {
      path: attachment.path,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
    };
  }

  async remove(id: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({ where: { id } });
    if (!attachment) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Attachment not found' });

    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
    }

    await this.prisma.attachment.delete({ where: { id } });

    await this.auditService.log({
      userId,
      action: 'DELETE',
      entity: 'attachments',
      entityId: id,
      oldValues: { originalName: attachment.originalName },
    });

    return { message: 'Attachment deleted' };
  }
}

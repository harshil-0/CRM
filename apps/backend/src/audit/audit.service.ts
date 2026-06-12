import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogQueryDto } from './dto';
import { parsePagination } from '@crm/utils';

export interface AuditLogInput {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(input: AuditLogInput) {
    return this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        oldValues: input.oldValues as Prisma.InputJsonValue,
        newValues: input.newValues as Prisma.InputJsonValue,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  }

  async findAll(query: AuditLogQueryDto) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Prisma.AuditLogWhereInput = {};

    if (query.userId) where.userId = query.userId;
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        user: log.user
          ? { firstName: log.user.firstName, lastName: log.user.lastName, email: log.user.email }
          : undefined,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        oldValues: log.oldValues as Record<string, unknown> | null,
        newValues: log.newValues as Record<string, unknown> | null,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt.toISOString(),
      })),
      meta: { page, limit, total },
    };
  }
}

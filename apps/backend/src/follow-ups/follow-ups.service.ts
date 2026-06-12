import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { formatUserSummary } from '../common/utils/user-summary';
import { CreateFollowUpDto, UpdateFollowUpDto, FollowUpQueryDto } from './dto';
import { parsePagination } from '@crm/utils';

const userSelect = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true };

@Injectable()
export class FollowUpsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(query: FollowUpQueryDto) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Prisma.FollowUpWhereInput = {};

    if (query.leadId) where.leadId = query.leadId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.status === 'pending') where.completedAt = null;
    if (query.status === 'completed') where.completedAt = { not: null };

    const [followUps, total] = await Promise.all([
      this.prisma.followUp.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          createdBy: { select: userSelect },
          lead: { select: { id: true, title: true } },
          customer: { select: { id: true, name: true } },
        },
      }),
      this.prisma.followUp.count({ where }),
    ]);

    return {
      data: followUps.map((f) => this.formatFollowUp(f)),
      meta: { page, limit, total },
    };
  }

  async findOne(id: string) {
    const followUp = await this.prisma.followUp.findUnique({
      where: { id },
      include: {
        createdBy: { select: userSelect },
        lead: { select: { id: true, title: true } },
        customer: { select: { id: true, name: true } },
      },
    });
    if (!followUp) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Follow-up not found' });
    return this.formatFollowUp(followUp);
  }

  async create(dto: CreateFollowUpDto, actorId: string) {
    if (!dto.leadId && !dto.customerId && !dto.taskId) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Follow-up must be linked to a lead, customer, or task',
      });
    }

    const followUp = await this.prisma.followUp.create({
      data: {
        scheduledAt: new Date(dto.scheduledAt),
        notes: dto.notes,
        leadId: dto.leadId,
        customerId: dto.customerId,
        taskId: dto.taskId,
        createdById: actorId,
      },
      include: {
        createdBy: { select: userSelect },
        lead: { select: { id: true, title: true } },
        customer: { select: { id: true, name: true } },
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'follow_ups',
      entityId: followUp.id,
      newValues: { scheduledAt: dto.scheduledAt },
    });

    return this.formatFollowUp(followUp);
  }

  async update(id: string, dto: UpdateFollowUpDto, actorId: string) {
    const existing = await this.prisma.followUp.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Follow-up not found' });

    const followUp = await this.prisma.followUp.update({
      where: { id },
      data: {
        notes: dto.notes,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
      include: {
        createdBy: { select: userSelect },
        lead: { select: { id: true, title: true } },
        customer: { select: { id: true, name: true } },
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'follow_ups',
      entityId: id,
      newValues: dto as Record<string, unknown>,
    });

    return this.formatFollowUp(followUp);
  }

  async complete(id: string, actorId: string) {
    const existing = await this.prisma.followUp.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Follow-up not found' });

    const followUp = await this.prisma.followUp.update({
      where: { id },
      data: { completedAt: new Date() },
      include: {
        createdBy: { select: userSelect },
        lead: { select: { id: true, title: true } },
        customer: { select: { id: true, name: true } },
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'follow_ups',
      entityId: id,
      newValues: { completed: true },
    });

    return this.formatFollowUp(followUp);
  }

  async remove(id: string, actorId: string) {
    const existing = await this.prisma.followUp.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Follow-up not found' });

    await this.prisma.followUp.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entity: 'follow_ups',
      entityId: id,
    });

    return { message: 'Follow-up deleted' };
  }

  private formatFollowUp(followUp: {
    id: string;
    notes: string | null;
    scheduledAt: Date;
    completedAt: Date | null;
    leadId: string | null;
    customerId: string | null;
    taskId: string | null;
    createdAt: Date;
    createdBy?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
    lead?: { id: string; title: string } | null;
    customer?: { id: string; name: string } | null;
  }) {
    return {
      id: followUp.id,
      notes: followUp.notes,
      scheduledAt: followUp.scheduledAt.toISOString(),
      completedAt: followUp.completedAt?.toISOString() ?? null,
      leadId: followUp.leadId,
      customerId: followUp.customerId,
      taskId: followUp.taskId,
      lead: followUp.lead ?? null,
      customer: followUp.customer ?? null,
      createdBy: followUp.createdBy ? formatUserSummary(followUp.createdBy) : undefined,
      createdAt: followUp.createdAt.toISOString(),
    };
  }
}

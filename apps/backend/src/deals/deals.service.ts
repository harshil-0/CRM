import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PipelinesService } from '../pipelines/pipelines.service';
import { formatUserSummary } from '../common/utils/user-summary';
import { CreateDealDto, UpdateDealDto, DealQueryDto } from './dto';
import { parsePagination } from '@crm/utils';

const userSelect = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true };

@Injectable()
export class DealsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private pipelinesService: PipelinesService,
  ) {}

  async findAll(query: DealQueryDto) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Prisma.DealWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.pipelineId) where.pipelineId = query.pipelineId;
    if (query.stage) where.stage = query.stage;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.customerId) where.customerId = query.customerId;

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          assignedTo: { select: userSelect },
          createdBy: { select: userSelect },
          customer: { select: { id: true, name: true, company: true } },
          pipeline: { select: { id: true, name: true, stages: true } },
        },
      }),
      this.prisma.deal.count({ where }),
    ]);

    return {
      data: deals.map((d) => this.formatDeal(d)),
      meta: { page, limit, total },
    };
  }

  async findByPipeline(pipelineId: string) {
    const pipeline = await this.prisma.pipeline.findUnique({ where: { id: pipelineId } });
    if (!pipeline) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Pipeline not found' });

    const deals = await this.prisma.deal.findMany({
      where: { pipelineId },
      orderBy: { updatedAt: 'desc' },
      include: {
        assignedTo: { select: userSelect },
        customer: { select: { id: true, name: true, company: true } },
      },
    });

    const stages = this.pipelinesService.getStages(pipeline);
    return {
      pipeline: {
        id: pipeline.id,
        name: pipeline.name,
        stages,
      },
      deals: deals.map((d) => this.formatDeal(d)),
    };
  }

  async findOne(id: string) {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        assignedTo: { select: userSelect },
        createdBy: { select: userSelect },
        customer: { select: { id: true, name: true, company: true } },
        pipeline: { select: { id: true, name: true, stages: true } },
      },
    });
    if (!deal) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Deal not found' });
    return this.formatDeal(deal);
  }

  async create(dto: CreateDealDto, actorId: string) {
    const pipeline = await this.prisma.pipeline.findUnique({ where: { id: dto.pipelineId } });
    if (!pipeline) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Pipeline not found' });

    const stages = this.pipelinesService.getStages(pipeline);
    if (!stages.some((s) => s.id === dto.stage)) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid pipeline stage' });
    }

    const deal = await this.prisma.deal.create({
      data: {
        title: dto.title,
        value: dto.value,
        currency: dto.currency ?? 'INR',
        stage: dto.stage,
        pipelineId: dto.pipelineId,
        customerId: dto.customerId,
        assignedToId: dto.assignedToId,
        expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined,
        probability: dto.probability ?? 0,
        notes: dto.notes,
        createdById: actorId,
      },
      include: {
        assignedTo: { select: userSelect },
        createdBy: { select: userSelect },
        customer: { select: { id: true, name: true, company: true } },
        pipeline: { select: { id: true, name: true, stages: true } },
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'deals',
      entityId: deal.id,
      newValues: { title: deal.title, value: Number(deal.value), stage: deal.stage },
    });

    return this.formatDeal(deal);
  }

  async update(id: string, dto: UpdateDealDto, actorId: string) {
    const existing = await this.prisma.deal.findUnique({
      where: { id },
      include: { pipeline: true },
    });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Deal not found' });

    if (dto.stage) {
      const stages = this.pipelinesService.getStages(existing.pipeline);
      if (!stages.some((s) => s.id === dto.stage)) {
        throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid pipeline stage' });
      }
    }

    const deal = await this.prisma.deal.update({
      where: { id },
      data: {
        ...dto,
        expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined,
      },
      include: {
        assignedTo: { select: userSelect },
        createdBy: { select: userSelect },
        customer: { select: { id: true, name: true, company: true } },
        pipeline: { select: { id: true, name: true, stages: true } },
      },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'deals',
      entityId: id,
      oldValues: { stage: existing.stage, title: existing.title },
      newValues: dto as Record<string, unknown>,
    });

    return this.formatDeal(deal);
  }

  async move(id: string, stage: string, actorId: string) {
    return this.update(id, { stage }, actorId);
  }

  async remove(id: string, actorId: string) {
    const existing = await this.prisma.deal.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Deal not found' });

    await this.prisma.deal.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entity: 'deals',
      entityId: id,
      oldValues: { title: existing.title },
    });

    return { message: 'Deal deleted' };
  }

  private formatDeal(deal: {
    id: string;
    title: string;
    value: Prisma.Decimal;
    currency: string;
    stage: string;
    pipelineId: string;
    customerId: string | null;
    expectedCloseDate: Date | null;
    probability: number;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    assignedTo?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null } | null;
    createdBy?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
    customer?: { id: string; name: string; company: string | null } | null;
    pipeline?: { id: string; name: string; stages: unknown };
  }) {
    return {
      id: deal.id,
      title: deal.title,
      value: Number(deal.value),
      currency: deal.currency,
      stage: deal.stage,
      pipelineId: deal.pipelineId,
      pipeline: deal.pipeline
        ? { id: deal.pipeline.id, name: deal.pipeline.name, stages: deal.pipeline.stages }
        : undefined,
      customerId: deal.customerId,
      customer: deal.customer ?? null,
      expectedCloseDate: deal.expectedCloseDate?.toISOString() ?? null,
      probability: deal.probability,
      notes: deal.notes,
      assignedTo: deal.assignedTo ? formatUserSummary(deal.assignedTo) : null,
      createdBy: deal.createdBy ? formatUserSummary(deal.createdBy) : undefined,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
    };
  }
}

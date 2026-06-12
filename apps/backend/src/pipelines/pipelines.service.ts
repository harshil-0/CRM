import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto';

export interface PipelineStage {
  id: string;
  name: string;
  color?: string;
  order: number;
}

@Injectable()
export class PipelinesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll() {
    const pipelines = await this.prisma.pipeline.findMany({
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { deals: true } } },
    });
    return pipelines.map((p) => this.formatPipeline(p));
  }

  async findOne(id: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: { _count: { select: { deals: true } } },
    });
    if (!pipeline) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Pipeline not found' });
    return this.formatPipeline(pipeline);
  }

  async findDefault() {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { isDefault: true },
      include: { _count: { select: { deals: true } } },
    });
    if (!pipeline) throw new NotFoundException({ code: 'NOT_FOUND', message: 'No default pipeline configured' });
    return this.formatPipeline(pipeline);
  }

  async create(dto: CreatePipelineDto, actorId: string) {
    if (dto.isDefault) {
      await this.prisma.pipeline.updateMany({ data: { isDefault: false }, where: { isDefault: true } });
    }

    const pipeline = await this.prisma.pipeline.create({
      data: {
        name: dto.name,
        stages: dto.stages as unknown as Prisma.InputJsonValue,
        isDefault: dto.isDefault ?? false,
      },
      include: { _count: { select: { deals: true } } },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'pipelines',
      entityId: pipeline.id,
      newValues: { name: pipeline.name },
    });

    return this.formatPipeline(pipeline);
  }

  async update(id: string, dto: UpdatePipelineDto, actorId: string) {
    const existing = await this.prisma.pipeline.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Pipeline not found' });

    const pipeline = await this.prisma.pipeline.update({
      where: { id },
      data: {
        name: dto.name,
        stages: dto.stages ? (dto.stages as unknown as Prisma.InputJsonValue) : undefined,
      },
      include: { _count: { select: { deals: true } } },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'pipelines',
      entityId: id,
      newValues: dto as Record<string, unknown>,
    });

    return this.formatPipeline(pipeline);
  }

  async remove(id: string, actorId: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: { _count: { select: { deals: true } } },
    });
    if (!pipeline) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Pipeline not found' });
    if (pipeline.isDefault) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Cannot delete default pipeline' });
    }
    if (pipeline._count.deals > 0) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Pipeline has active deals' });
    }

    await this.prisma.pipeline.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entity: 'pipelines',
      entityId: id,
      oldValues: { name: pipeline.name },
    });

    return { message: 'Pipeline deleted' };
  }

  getStages(pipeline: { stages: unknown }): PipelineStage[] {
    return pipeline.stages as PipelineStage[];
  }

  private formatPipeline(pipeline: {
    id: string;
    name: string;
    stages: unknown;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: { deals: number };
  }) {
    return {
      id: pipeline.id,
      name: pipeline.name,
      stages: pipeline.stages as PipelineStage[],
      isDefault: pipeline.isDefault,
      dealCount: pipeline._count?.deals ?? 0,
      createdAt: pipeline.createdAt.toISOString(),
      updatedAt: pipeline.updatedAt.toISOString(),
    };
  }
}

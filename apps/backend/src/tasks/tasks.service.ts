import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { formatUserSummary } from '../common/utils/user-summary';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto';
import { parsePagination } from '@crm/utils';

const userSelect = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true };

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(query: TaskQueryDto) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Prisma.TaskWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.relatedEntity) where.relatedEntity = query.relatedEntity;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
        include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: tasks.map((t) => this.formatTask(t)),
      meta: { page, limit, total },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
    });
    if (!task) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Task not found' });
    return this.formatTask(task);
  }

  async create(dto: CreateTaskDto, actorId: string) {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        priority: dto.priority ?? 'medium',
        status: dto.status ?? 'pending',
        assignedToId: dto.assignedToId,
        relatedEntity: dto.relatedEntity,
        relatedEntityId: dto.relatedEntityId,
        createdById: actorId,
      },
      include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'tasks',
      entityId: task.id,
      newValues: { title: task.title, status: task.status },
    });

    return this.formatTask(task);
  }

  async update(id: string, dto: UpdateTaskDto, actorId: string) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Task not found' });

    const task = await this.prisma.task.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'tasks',
      entityId: id,
      oldValues: { status: existing.status, title: existing.title },
      newValues: dto as Record<string, unknown>,
    });

    return this.formatTask(task);
  }

  async remove(id: string, actorId: string) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Task not found' });

    await this.prisma.task.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entity: 'tasks',
      entityId: id,
      oldValues: { title: existing.title },
    });

    return { message: 'Task deleted' };
  }

  private formatTask(task: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    priority: string;
    status: string;
    relatedEntity: string | null;
    relatedEntityId: string | null;
    createdAt: Date;
    updatedAt: Date;
    assignedTo?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null } | null;
    createdBy?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
  }) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate?.toISOString() ?? null,
      priority: task.priority,
      status: task.status,
      relatedEntity: task.relatedEntity,
      relatedEntityId: task.relatedEntityId,
      assignedTo: task.assignedTo ? formatUserSummary(task.assignedTo) : null,
      createdBy: task.createdBy ? formatUserSummary(task.createdBy) : undefined,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }
}

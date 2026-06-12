import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { formatUserSummary } from '../common/utils/user-summary';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto } from './dto';
import { parsePagination } from '@crm/utils';

const userSelect = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true };

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(query: LeadQueryDto) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Prisma.LeadWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.status) where.status = query.status;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.source) where.source = query.source;

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: leads.map((l) => this.formatLead(l)),
      meta: { page, limit, total },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
    });
    if (!lead) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Lead not found' });
    return this.formatLead(lead);
  }

  async create(dto: CreateLeadDto, actorId: string) {
    const lead = await this.prisma.lead.create({
      data: {
        title: dto.title,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        source: dto.source,
        status: dto.status ?? 'new',
        score: dto.score ?? 0,
        notes: dto.notes,
        assignedToId: dto.assignedToId,
        createdById: actorId,
      },
      include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'leads',
      entityId: lead.id,
      newValues: { title: lead.title, status: lead.status },
    });

    return this.formatLead(lead);
  }

  async update(id: string, dto: UpdateLeadDto, actorId: string) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Lead not found' });
    if (existing.convertedAt) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Cannot update converted lead' });
    }

    const lead = await this.prisma.lead.update({
      where: { id },
      data: dto,
      include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'leads',
      entityId: id,
      oldValues: { status: existing.status, title: existing.title },
      newValues: dto as Record<string, unknown>,
    });

    return this.formatLead(lead);
  }

  async assign(id: string, assignedToId: string, actorId: string) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Lead not found' });

    const assignee = await this.prisma.user.findUnique({ where: { id: assignedToId } });
    if (!assignee || !assignee.isActive) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid assignee' });
    }

    const lead = await this.prisma.lead.update({
      where: { id },
      data: { assignedToId },
      include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'leads',
      entityId: id,
      oldValues: { assignedToId: existing.assignedToId },
      newValues: { assignedToId },
    });

    if (assignedToId !== actorId) {
      await this.notificationsService.create({
        userId: assignedToId,
        type: 'lead',
        title: 'Lead assigned to you',
        message: `You have been assigned lead: ${lead.title}`,
        link: '/leads',
      });
    }

    return this.formatLead(lead);
  }

  async convert(id: string, actorId: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    if (!lead) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Lead not found' });
    if (lead.convertedAt) {
      throw new ConflictException({ code: 'CONFLICT', message: 'Lead already converted' });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          name: lead.title,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          assignedToId: lead.assignedToId,
          createdById: actorId,
          tags: lead.source ? [lead.source] : [],
        },
      });

      const updatedLead = await tx.lead.update({
        where: { id },
        data: {
          status: 'won',
          convertedAt: new Date(),
          customerId: customer.id,
        },
        include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
      });

      return { lead: updatedLead, customer };
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'leads',
      entityId: id,
      newValues: { converted: true, customerId: result.customer.id },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'customers',
      entityId: result.customer.id,
      newValues: { name: result.customer.name, fromLead: id },
    });

    return {
      lead: this.formatLead(result.lead),
      customer: {
        id: result.customer.id,
        name: result.customer.name,
        email: result.customer.email,
        company: result.customer.company,
      },
    };
  }

  async remove(id: string, actorId: string) {
    const existing = await this.prisma.lead.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Lead not found' });

    await this.prisma.lead.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entity: 'leads',
      entityId: id,
      oldValues: { title: existing.title },
    });

    return { message: 'Lead deleted' };
  }

  private formatLead(lead: {
    id: string;
    title: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    source: string | null;
    status: string;
    score: number;
    notes: string | null;
    convertedAt: Date | null;
    customerId: string | null;
    createdAt: Date;
    updatedAt: Date;
    assignedTo?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null } | null;
    createdBy?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
  }) {
    return {
      id: lead.id,
      title: lead.title,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      source: lead.source,
      status: lead.status,
      score: lead.score,
      notes: lead.notes,
      convertedAt: lead.convertedAt?.toISOString() ?? null,
      customerId: lead.customerId,
      assignedTo: lead.assignedTo ? formatUserSummary(lead.assignedTo) : null,
      createdBy: lead.createdBy ? formatUserSummary(lead.createdBy) : undefined,
      createdAt: lead.createdAt.toISOString(),
      updatedAt: lead.updatedAt.toISOString(),
    };
  }
}

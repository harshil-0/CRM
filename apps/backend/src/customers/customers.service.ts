import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { formatUserSummary } from '../common/utils/user-summary';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto';
import { parsePagination } from '@crm/utils';

const userSelect = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true };

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(query: CustomerQueryDto) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Prisma.CustomerWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.tag) where.tags = { has: query.tag };

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers.map((c) => this.formatCustomer(c)),
      meta: { page, limit, total },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
    });
    if (!customer) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Customer not found' });
    return this.formatCustomer(customer);
  }

  async create(dto: CreateCustomerDto, actorId: string) {
    const customer = await this.prisma.customer.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        address: dto.address,
        tags: dto.tags ?? [],
        assignedToId: dto.assignedToId,
        createdById: actorId,
      },
      include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'customers',
      entityId: customer.id,
      newValues: { name: customer.name },
    });

    return this.formatCustomer(customer);
  }

  async update(id: string, dto: UpdateCustomerDto, actorId: string) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Customer not found' });

    const customer = await this.prisma.customer.update({
      where: { id },
      data: dto,
      include: { assignedTo: { select: userSelect }, createdBy: { select: userSelect } },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'customers',
      entityId: id,
      oldValues: { name: existing.name },
      newValues: dto as Record<string, unknown>,
    });

    return this.formatCustomer(customer);
  }

  async remove(id: string, actorId: string) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Customer not found' });

    await this.prisma.customer.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entity: 'customers',
      entityId: id,
      oldValues: { name: existing.name },
    });

    return { message: 'Customer deleted' };
  }

  private formatCustomer(customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    address: string | null;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
    assignedTo?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null } | null;
    createdBy?: { id: string; firstName: string; lastName: string; email: string; avatarUrl: string | null };
  }) {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      address: customer.address,
      tags: customer.tags,
      assignedTo: customer.assignedTo ? formatUserSummary(customer.assignedTo) : null,
      createdBy: customer.createdBy ? formatUserSummary(customer.createdBy) : undefined,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  }
}

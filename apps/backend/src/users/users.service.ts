import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
import { parsePagination } from '@crm/utils';
import { hashPassword } from '../common/utils/password.util';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll(query: UserQueryDto) {
    const { page, limit, skip } = parsePagination(query.page, query.limit);
    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.roleId) where.roleId = query.roleId;
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { role: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => this.formatUser(u)),
      meta: { page, limit, total },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });
    return this.formatUser(user);
  }

  async findAssignable() {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      avatarUrl: u.avatarUrl,
    }));
  }

  async create(dto: CreateUserDto, actorId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException({ code: 'CONFLICT', message: 'Email already registered' });
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        roleId: dto.roleId,
      },
      include: { role: true },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'users',
      entityId: user.id,
      newValues: { email: user.email, role: user.role.name },
    });

    return this.formatUser(user);
  }

  async update(id: string, dto: UpdateUserDto, actorId: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: { role: true },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'users',
      entityId: id,
      oldValues: { firstName: existing.firstName, isActive: existing.isActive },
      newValues: dto as Record<string, unknown>,
    });

    return this.formatUser(user);
  }

  async remove(id: string, actorId: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });

    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: { role: true },
    });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entity: 'users',
      entityId: id,
      oldValues: { isActive: true },
      newValues: { isActive: false },
    });

    return this.formatUser(user);
  }

  private formatUser(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    phone: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    role: { id: string; name: string; displayName: string };
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      isActive: user.isActive,
      role: { id: user.role.id, name: user.role.name, displayName: user.role.displayName },
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from './dto';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });

    return roles.map((r) => this.formatRole(r));
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });
    if (!role) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Role not found' });
    return this.formatRole(role);
  }

  async create(dto: CreateRoleDto, actorId: string) {
    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        displayName: dto.displayName,
        description: dto.description,
      },
    });

    if (dto.permissionIds?.length) {
      await this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
      });
    }

    await this.auditService.log({
      userId: actorId,
      action: 'CREATE',
      entity: 'roles',
      entityId: role.id,
      newValues: { name: role.name },
    });

    return this.findOne(role.id);
  }

  async update(id: string, dto: UpdateRoleDto, actorId: string) {
    const existing = await this.prisma.role.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Role not found' });

    await this.prisma.role.update({ where: { id }, data: dto });

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'roles',
      entityId: id,
      newValues: dto as Record<string, unknown>,
    });

    return this.findOne(id);
  }

  async remove(id: string, actorId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Role not found' });
    if (role.isSystem) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Cannot delete system role' });
    }
    if (role._count.users > 0) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Role has assigned users' });
    }

    await this.prisma.role.delete({ where: { id } });

    await this.auditService.log({
      userId: actorId,
      action: 'DELETE',
      entity: 'roles',
      entityId: id,
      oldValues: { name: role.name },
    });

    return { message: 'Role deleted' };
  }

  async getPermissions(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Role not found' });
    return role.permissions.map((rp) => this.formatPermission(rp.permission));
  }

  async updatePermissions(id: string, dto: UpdateRolePermissionsDto, actorId: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Role not found' });

    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    if (dto.permissionIds.length) {
      await this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
      });
    }

    await this.auditService.log({
      userId: actorId,
      action: 'UPDATE',
      entity: 'roles',
      entityId: id,
      newValues: { permissionIds: dto.permissionIds },
    });

    return this.getPermissions(id);
  }

  async findAllPermissions() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
    return permissions.map((p) => this.formatPermission(p));
  }

  private formatPermission(p: {
    id: string;
    name: string;
    displayName: string;
    module: string;
    action: string;
  }) {
    return {
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      module: p.module,
      action: p.action,
    };
  }

  private formatRole(role: {
    id: string;
    name: string;
    displayName: string;
    description: string | null;
    isSystem: boolean;
    createdAt: Date;
    permissions?: { permission: { id: string; name: string; displayName: string; module: string; action: string } }[];
    _count?: { users: number };
  }) {
    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count?.users ?? 0,
      permissions: role.permissions?.map((rp) => this.formatPermission(rp.permission)),
      createdAt: role.createdAt.toISOString(),
    };
  }
}

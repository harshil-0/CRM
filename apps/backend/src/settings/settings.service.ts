import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateProfileDto } from './dto';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private auditService: AuditService,
  ) {}

  getClientConfig() {
    const enabledModules = this.config.get<string>('ENABLED_MODULES', 'leads,customers,deals,tasks,reports,settings');
    return {
      appName: this.config.get<string>('APP_NAME', 'CRM Platform'),
      logoUrl: this.config.get<string>('APP_LOGO_URL') || null,
      primaryColor: this.config.get<string>('PRIMARY_COLOR', '#18181B'),
      enabledModules: enabledModules.split(',').map((m) => m.trim()),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    await this.auditService.log({
      userId,
      action: 'UPDATE',
      entity: 'users',
      entityId: userId,
      oldValues: { firstName: existing.firstName, lastName: existing.lastName },
      newValues: dto as Record<string, unknown>,
    });

    const permissions = user.role.permissions.map((rp) => rp.permission.name);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      isActive: user.isActive,
      role: { id: user.role.id, name: user.role.name, displayName: user.role.displayName },
      permissions,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
    };
  }
}

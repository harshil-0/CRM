import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private auditService: AuditService,
    @InjectQueue('email') private emailQueue: Queue,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException({ code: 'CONFLICT', message: 'Email already registered' });
    }

    let roleId = dto.roleId;
    if (!roleId) {
      const defaultRole = await this.prisma.role.findUnique({ where: { name: 'sales_rep' } });
      if (!defaultRole) throw new BadRequestException('Default role not found');
      roleId = defaultRole.id;
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId,
      },
      include: { role: true },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'CREATE',
      entity: 'users',
      entityId: user.id,
      newValues: { email: user.email, role: user.role.name },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: { id: user.role.id, name: user.role.name, displayName: user.role.displayName },
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      await this.auditService.log({
        action: 'LOGIN_FAILED',
        entity: 'auth',
        newValues: { email: dto.email },
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entity: 'auth',
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role.name);
    const permissions = user.role.permissions.map((rp) => rp.permission.name);

    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      entity: 'auth',
      ipAddress,
      userAgent,
    });

    return {
      ...tokens,
      user: this.formatUserProfile(user, permissions),
    };
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: this.hashToken(refreshToken) },
      include: { user: { include: { role: true } } },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Invalid refresh token' });
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(stored.user.id, stored.user.email, stored.user.role.name);
  }

  async logout(refreshToken: string, userId?: string) {
    const hashed = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { token: hashed, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    if (userId) {
      await this.auditService.log({ userId, action: 'LOGOUT', entity: 'auth' });
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: this.hashToken(resetToken),
          passwordResetExpires: expires,
        },
      });

      await this.emailQueue.add('password-reset', {
        email: user.email,
        firstName: user.firstName,
        resetToken,
      });
    }

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const hashed = this.hashToken(dto.token);
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hashed,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    await this.auditService.log({
      userId: user.id,
      action: 'PASSWORD_RESET',
      entity: 'users',
      entityId: user.id,
    });

    return { message: 'Password reset successfully' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!user) throw new UnauthorizedException();
    const permissions = user.role.permissions.map((rp) => rp.permission.name);
    return this.formatUserProfile(user, permissions);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshExpires = this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresMs = this.parseDuration(refreshExpires);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + expiresMs),
      },
    });

    const accessExpires = this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m');

    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor(this.parseDuration(accessExpires) / 1000),
    };
  }

  private formatUserProfile(
    user: {
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
    },
    permissions: string[],
  ) {
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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 900000;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * (multipliers[unit] || 60000);
  }
}

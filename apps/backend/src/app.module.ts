import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';
import { LeadsModule } from './leads/leads.module';
import { CustomersModule } from './customers/customers.module';
import { TasksModule } from './tasks/tasks.module';
import { ReportsModule } from './reports/reports.module';
import { PipelinesModule } from './pipelines/pipelines.module';
import { DealsModule } from './deals/deals.module';
import { FollowUpsModule } from './follow-ups/follow-ups.module';
import { SettingsModule } from './settings/settings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { ImportExportModule } from './import-export/import-export.module';
import { appProviders } from './app.providers';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    AuditModule,
    HealthModule,
    LeadsModule,
    CustomersModule,
    TasksModule,
    ReportsModule,
    PipelinesModule,
    DealsModule,
    FollowUpsModule,
    SettingsModule,
    NotificationsModule,
    AttachmentsModule,
    ImportExportModule,
  ],
  providers: [...appProviders],
})
export class AppModule {}

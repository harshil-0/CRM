import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule, BullModule.registerQueue({ name: 'notifications' })],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}

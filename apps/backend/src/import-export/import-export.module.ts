import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';
import { ImportProcessor } from './import.processor';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    AuditModule,
    BullModule.registerQueue({ name: 'import' }),
  ],
  controllers: [ImportExportController],
  providers: [ImportExportService, ImportProcessor],
  exports: [ImportExportService],
})
export class ImportExportModule {}

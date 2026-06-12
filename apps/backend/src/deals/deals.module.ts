import { Module } from '@nestjs/common';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { AuditModule } from '../audit/audit.module';
import { PipelinesModule } from '../pipelines/pipelines.module';

@Module({
  imports: [AuditModule, PipelinesModule],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('summary')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get CRM summary report' })
  getSummary() {
    return this.reportsService.getSummary();
  }

  @Get('deals')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get deals pipeline report' })
  getDealsReport() {
    return this.reportsService.getDealsReport();
  }

  @Get('activity')
  @RequirePermissions('reports:read')
  @ApiOperation({ summary: 'Get recent activity report' })
  getActivityReport() {
    return this.reportsService.getActivityReport();
  }
}

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Import / Export')
@ApiBearerAuth()
@Controller()
export class ImportExportController {
  constructor(private importExportService: ImportExportService) {}

  @Get('export/leads')
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Export leads as CSV' })
  async exportLeads(@Res() res: Response) {
    const { filename, content } = await this.importExportService.exportEntity('leads');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  @Get('export/customers')
  @RequirePermissions('customers:read')
  @ApiOperation({ summary: 'Export customers as CSV' })
  async exportCustomers(@Res() res: Response) {
    const { filename, content } = await this.importExportService.exportEntity('customers');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  @Post('import/leads')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Import leads from CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  importLeads(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId: string,
  ) {
    return this.importExportService.startImport('leads', file, userId);
  }

  @Post('import/customers')
  @RequirePermissions('customers:write')
  @ApiOperation({ summary: 'Import customers from CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  importCustomers(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') userId: string,
  ) {
    return this.importExportService.startImport('customers', file, userId);
  }

  @Get('import/jobs/:id')
  @ApiOperation({ summary: 'Get import job status' })
  getJob(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId: string) {
    return this.importExportService.getImportJob(id, userId);
  }
}

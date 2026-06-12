import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import * as fs from 'fs';
import { AttachmentsService } from './attachments.service';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Attachments')
@ApiBearerAuth()
@Controller('attachments')
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List attachments for an entity' })
  findByEntity(
    @Query('entity') entity: string,
    @Query('entityId', ParseUUIDPipe) entityId: string,
  ) {
    return this.attachmentsService.findByEntity(entity, entityId);
  }

  @Post()
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Upload attachment' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Query('entity') entity: string,
    @Query('entityId', ParseUUIDPipe) entityId: string,
    @CurrentUser('sub') userId: string,
  ) {
    if (!entity || !entityId) {
      throw new BadRequestException({ code: 'VALIDATION_ERROR', message: 'entity and entityId are required' });
    }
    return this.attachmentsService.upload(file, entity, entityId, userId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download attachment file' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sub') userId: string,
    @Res() res: Response,
  ) {
    const file = await this.attachmentsService.getFile(id, userId);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    const stream = fs.createReadStream(file.path);
    stream.pipe(res);
  }

  @Delete(':id')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Delete attachment' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') userId: string) {
    return this.attachmentsService.remove(id, userId);
  }
}

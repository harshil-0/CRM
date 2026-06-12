import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PipelinesService } from './pipelines.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Pipelines')
@ApiBearerAuth()
@Controller('pipelines')
export class PipelinesController {
  constructor(private pipelinesService: PipelinesService) {}

  @Get()
  @RequirePermissions('deals:read')
  @ApiOperation({ summary: 'List all pipelines' })
  findAll() {
    return this.pipelinesService.findAll();
  }

  @Get('default')
  @RequirePermissions('deals:read')
  @ApiOperation({ summary: 'Get default pipeline' })
  findDefault() {
    return this.pipelinesService.findDefault();
  }

  @Get(':id')
  @RequirePermissions('deals:read')
  @ApiOperation({ summary: 'Get pipeline by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pipelinesService.findOne(id);
  }

  @Post()
  @RequirePermissions('deals:write')
  @ApiOperation({ summary: 'Create pipeline' })
  create(@Body() dto: CreatePipelineDto, @CurrentUser('sub') actorId: string) {
    return this.pipelinesService.create(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('deals:write')
  @ApiOperation({ summary: 'Update pipeline' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePipelineDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.pipelinesService.update(id, dto, actorId);
  }

  @Delete(':id')
  @RequirePermissions('deals:write')
  @ApiOperation({ summary: 'Delete pipeline' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.pipelinesService.remove(id, actorId);
  }
}

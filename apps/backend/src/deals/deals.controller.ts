import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { CreateDealDto, UpdateDealDto, MoveDealDto, DealQueryDto } from './dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Deals')
@ApiBearerAuth()
@Controller('deals')
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Get()
  @RequirePermissions('deals:read')
  @ApiOperation({ summary: 'List all deals' })
  findAll(@Query() query: DealQueryDto) {
    return this.dealsService.findAll(query);
  }

  @Get('pipeline/:pipelineId')
  @RequirePermissions('deals:read')
  @ApiOperation({ summary: 'Get deals grouped by pipeline (for Kanban)' })
  findByPipeline(@Param('pipelineId', ParseUUIDPipe) pipelineId: string) {
    return this.dealsService.findByPipeline(pipelineId);
  }

  @Get(':id')
  @RequirePermissions('deals:read')
  @ApiOperation({ summary: 'Get deal by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.dealsService.findOne(id);
  }

  @Post()
  @RequirePermissions('deals:write')
  @ApiOperation({ summary: 'Create a new deal' })
  create(@Body() dto: CreateDealDto, @CurrentUser('sub') actorId: string) {
    return this.dealsService.create(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('deals:write')
  @ApiOperation({ summary: 'Update deal' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDealDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.dealsService.update(id, dto, actorId);
  }

  @Post(':id/move')
  @RequirePermissions('deals:write')
  @ApiOperation({ summary: 'Move deal to a pipeline stage' })
  move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MoveDealDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.dealsService.move(id, dto.stage, actorId);
  }

  @Delete(':id')
  @RequirePermissions('deals:delete')
  @ApiOperation({ summary: 'Delete deal' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.dealsService.remove(id, actorId);
  }
}

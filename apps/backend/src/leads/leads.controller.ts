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
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto, AssignLeadDto, LeadQueryDto } from './dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Leads')
@ApiBearerAuth()
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Get()
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'List all leads' })
  findAll(@Query() query: LeadQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('leads:read')
  @ApiOperation({ summary: 'Get lead by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.findOne(id);
  }

  @Post()
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Create a new lead' })
  create(@Body() dto: CreateLeadDto, @CurrentUser('sub') actorId: string) {
    return this.leadsService.create(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Update lead' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.leadsService.update(id, dto, actorId);
  }

  @Post(':id/assign')
  @RequirePermissions('leads:assign')
  @ApiOperation({ summary: 'Assign lead to user' })
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignLeadDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.leadsService.assign(id, dto.assignedToId, actorId);
  }

  @Post(':id/convert')
  @RequirePermissions('leads:write')
  @ApiOperation({ summary: 'Convert lead to customer' })
  convert(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.leadsService.convert(id, actorId);
  }

  @Delete(':id')
  @RequirePermissions('leads:delete')
  @ApiOperation({ summary: 'Delete lead' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.leadsService.remove(id, actorId);
  }
}

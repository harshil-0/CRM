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
import { FollowUpsService } from './follow-ups.service';
import { CreateFollowUpDto, UpdateFollowUpDto, FollowUpQueryDto } from './dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Follow-ups')
@ApiBearerAuth()
@Controller('follow-ups')
export class FollowUpsController {
  constructor(private followUpsService: FollowUpsService) {}

  @Get()
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'List follow-ups' })
  findAll(@Query() query: FollowUpQueryDto) {
    return this.followUpsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Get follow-up by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.followUpsService.findOne(id);
  }

  @Post()
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Schedule a follow-up' })
  create(@Body() dto: CreateFollowUpDto, @CurrentUser('sub') actorId: string) {
    return this.followUpsService.create(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Update follow-up' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFollowUpDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.followUpsService.update(id, dto, actorId);
  }

  @Post(':id/complete')
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Mark follow-up as completed' })
  complete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.followUpsService.complete(id, actorId);
  }

  @Delete(':id')
  @RequirePermissions('tasks:delete')
  @ApiOperation({ summary: 'Delete follow-up' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.followUpsService.remove(id, actorId);
  }
}

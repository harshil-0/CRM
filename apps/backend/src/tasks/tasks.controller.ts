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
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskQueryDto } from './dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'List all tasks' })
  findAll(@Query() query: TaskQueryDto) {
    return this.tasksService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('tasks:read')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() dto: CreateTaskDto, @CurrentUser('sub') actorId: string) {
    return this.tasksService.create(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('tasks:write')
  @ApiOperation({ summary: 'Update task' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.tasksService.update(id, dto, actorId);
  }

  @Delete(':id')
  @RequirePermissions('tasks:delete')
  @ApiOperation({ summary: 'Delete task' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.tasksService.remove(id, actorId);
  }
}

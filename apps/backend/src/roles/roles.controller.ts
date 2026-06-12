import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from './dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'List all roles' })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions/all')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'List all permissions' })
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get(':id')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get role by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @RequirePermissions('roles:write')
  @ApiOperation({ summary: 'Create a new role' })
  create(@Body() dto: CreateRoleDto, @CurrentUser('sub') actorId: string) {
    return this.rolesService.create(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('roles:write')
  @ApiOperation({ summary: 'Update role' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.rolesService.update(id, dto, actorId);
  }

  @Delete(':id')
  @RequirePermissions('roles:write')
  @ApiOperation({ summary: 'Delete role' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.rolesService.remove(id, actorId);
  }

  @Get(':id/permissions')
  @RequirePermissions('roles:read')
  @ApiOperation({ summary: 'Get role permissions' })
  getPermissions(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.getPermissions(id);
  }

  @Put(':id/permissions')
  @RequirePermissions('roles:write')
  @ApiOperation({ summary: 'Update role permissions' })
  updatePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRolePermissionsDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.rolesService.updatePermissions(id, dto, actorId);
  }
}

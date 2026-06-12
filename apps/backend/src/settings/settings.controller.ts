import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateProfileDto } from './dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('client')
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Get client branding configuration' })
  getClientConfig() {
    return this.settingsService.getClientConfig();
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@Body() dto: UpdateProfileDto, @CurrentUser('sub') userId: string) {
    return this.settingsService.updateProfile(userId, dto);
  }
}

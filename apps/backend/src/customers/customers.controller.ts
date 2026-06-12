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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto, CustomerQueryDto } from './dto';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  @Get()
  @RequirePermissions('customers:read')
  @ApiOperation({ summary: 'List all customers' })
  findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('customers:read')
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  @RequirePermissions('customers:write')
  @ApiOperation({ summary: 'Create a new customer' })
  create(@Body() dto: CreateCustomerDto, @CurrentUser('sub') actorId: string) {
    return this.customersService.create(dto, actorId);
  }

  @Patch(':id')
  @RequirePermissions('customers:write')
  @ApiOperation({ summary: 'Update customer' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser('sub') actorId: string,
  ) {
    return this.customersService.update(id, dto, actorId);
  }

  @Delete(':id')
  @RequirePermissions('customers:delete')
  @ApiOperation({ summary: 'Delete customer' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('sub') actorId: string) {
    return this.customersService.remove(id, actorId);
  }
}

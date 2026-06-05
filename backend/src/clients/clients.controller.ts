import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles(UserRole.COMPANY_ADMIN)
  async create(@CurrentUser() user: any, @Body() dto: CreateClientDto) {
    return this.clientsService.create(user.companyId, dto);
  }

  @Get()
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async findAll(@CurrentUser() user: any) {
    return this.clientsService.findAll(user.companyId);
  }

  @Get(':id')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clientsService.findOne(user.companyId, id);
  }

  @Put(':id')
  @Roles(UserRole.COMPANY_ADMIN)
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateClientDto,
  ) {
    return this.clientsService.update(user.companyId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.COMPANY_ADMIN)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.clientsService.remove(user.companyId, id);
  }
}

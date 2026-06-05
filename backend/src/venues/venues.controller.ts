import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/venues')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Post()
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE)
  create(@CurrentUser() user: any, @Body() data: any) {
    return this.venuesService.create(user.companyId, data);
  }

  @Get()
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  findAll(@CurrentUser() user: any) {
    return this.venuesService.findAll(user.companyId);
  }

  @Get(':id')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.venuesService.findOne(user.companyId, id);
  }

  @Patch(':id')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE)
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() data: any) {
    return this.venuesService.update(user.companyId, id, data);
  }

  @Delete(':id')
  @Roles(UserRole.COMPANY_ADMIN)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.venuesService.remove(user.companyId, id);
  }
}

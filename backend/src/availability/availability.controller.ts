import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/availability')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  create(@CurrentUser() user: any, @Body() data: any) {
    return this.availabilityService.create(user.companyId, user.id, data);
  }

  @Get()
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  findAll(@CurrentUser() user: any, @Query('all') all?: string) {
    // COMPANY_ADMIN can see everyone if they request ?all=true
    if (user.role === UserRole.COMPANY_ADMIN && all === 'true') {
      return this.availabilityService.findAll(user.companyId);
    }
    // Otherwise, you only see your own availability
    return this.availabilityService.findAll(user.companyId, user.id);
  }

  @Patch(':id/status')
  @Roles(UserRole.COMPANY_ADMIN)
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.availabilityService.updateStatus(user.companyId, id, status);
  }

  @Delete(':id')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.availabilityService.remove(user.companyId, user.id, id, user.role);
  }
}

import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, CompanyStatus } from '@prisma/client';

@Controller('api/super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminController {
  constructor(private superAdminService: SuperAdminService) {}

  @Get('registrations')
  async listRegistrations() {
    return this.superAdminService.listRegistrations();
  }

  @Get('companies')
  async listCompanies() {
    return this.superAdminService.listCompanies();
  }

  @Patch('registrations/:id/approve')
  async approveRegistration(@Param('id') id: string) {
    return this.superAdminService.approveRegistration(id);
  }

  @Patch('registrations/:id/reject')
  async rejectRegistration(@Param('id') id: string) {
    return this.superAdminService.rejectRegistration(id);
  }

  @Patch('companies/:id/status')
  async toggleCompanyStatus(
    @Param('id') id: string,
    @Body('status') status: CompanyStatus,
  ) {
    return this.superAdminService.toggleCompanyStatus(id, status);
  }
}

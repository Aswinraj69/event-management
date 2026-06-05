import { Controller, Get, Put, Body, UseGuards, Param } from '@nestjs/common';
import { CompanyService, UpdateBrandingDto } from './company.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Get('public/:subdomain')
  async getPublicBranding(@Param('subdomain') subdomain: string) {
    const company = await this.companyService.findBySubdomain(subdomain);
    return {
      name: company.name,
      subdomain: company.subdomain,
      logoUrl: company.logoUrl,
      faviconUrl: company.faviconUrl,
      brandColors: company.brandColors,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('branding')
  async getBranding(@CurrentUser() user: any) {
    return this.companyService.getBranding(user.companyId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  @Put('branding')
  async updateBranding(@CurrentUser() user: any, @Body() dto: UpdateBrandingDto) {
    return this.companyService.updateBranding(user.companyId, dto);
  }
}

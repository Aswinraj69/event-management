import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, QuotationStatus } from '@prisma/client';

@Controller('api/quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async create(@CurrentUser() user: any, @Body() dto: CreateQuotationDto) {
    return this.quotationsService.create(user.companyId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async findAll(@CurrentUser() user: any) {
    return this.quotationsService.findAll(user.companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.quotationsService.findOne(user.companyId, id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: QuotationStatus,
  ) {
    return this.quotationsService.updateStatus(user.companyId, id, status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY_ADMIN)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.quotationsService.remove(user.companyId, id);
  }

  @Get('public/:token')
  async getPublicQuotation(@Param('token') token: string) {
    return this.quotationsService.findByMagicLink(token);
  }

  @Post('public/:token/sign')
  async signPublicQuotation(
    @Param('token') token: string,
    @Body('signatureData') signatureData: string,
  ) {
    return this.quotationsService.signQuotation(token, signatureData);
  }
}

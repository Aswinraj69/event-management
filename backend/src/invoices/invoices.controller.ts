import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { LogPaymentDto } from './dto/log-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('stats')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async getStats(@CurrentUser() user: any) {
    return this.invoicesService.getDashboardStats(user.companyId);
  }

  @Post()
  @Roles(UserRole.COMPANY_ADMIN)
  async create(@CurrentUser() user: any, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(user.companyId, dto);
  }

  @Get()
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async findAll(@CurrentUser() user: any) {
    return this.invoicesService.findAll(user.companyId);
  }

  @Get(':id')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.invoicesService.findOne(user.companyId, id);
  }

  @Post(':id/payments')
  @Roles(UserRole.COMPANY_ADMIN)
  async logPayment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: LogPaymentDto,
  ) {
    return this.invoicesService.logPayment(user.companyId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.COMPANY_ADMIN)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.invoicesService.remove(user.companyId, id);
  }
}

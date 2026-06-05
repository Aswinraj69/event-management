import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('api/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(UserRole.COMPANY_ADMIN)
  async create(@CurrentUser() user: any, @Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(user.companyId, dto);
  }

  @Get()
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async findAll(@CurrentUser() user: any) {
    return this.employeesService.findAll(user.companyId);
  }

  @Get(':id')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    // Check if the user is Company Admin OR if they are retrieving their own profile
    if (user.role !== UserRole.COMPANY_ADMIN && user.userId !== id) {
      throw new ForbiddenException('You are not authorized to view this employee profile.');
    }
    return this.employeesService.findOne(user.companyId, id);
  }

  @Put(':id')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeProfileDto,
  ) {
    // Check if the user is Company Admin OR if they are updating their own profile
    if (user.role !== UserRole.COMPANY_ADMIN && user.userId !== id) {
      throw new ForbiddenException('You are not authorized to update this employee profile.');
    }
    return this.employeesService.update(user.companyId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.COMPANY_ADMIN)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.employeesService.remove(user.companyId, id);
  }
}

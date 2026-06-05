import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, AssignmentStatus } from '@prisma/client';

@Controller('api/events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(UserRole.COMPANY_ADMIN)
  async create(@CurrentUser() user: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.companyId, dto);
  }

  @Get()
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async findAll(@CurrentUser() user: any) {
    return this.eventsService.findAll(user.companyId);
  }

  @Get('my-assignments')
  @Roles(UserRole.EMPLOYEE, UserRole.FREELANCER)
  async getMyAssignments(@CurrentUser() user: any) {
    return this.eventsService.getStaffAssignments(user.userId);
  }

  @Get(':id')
  @Roles(UserRole.COMPANY_ADMIN, UserRole.EMPLOYEE, UserRole.FREELANCER)
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.eventsService.findOne(user.companyId, id);
  }

  @Put(':id')
  @Roles(UserRole.COMPANY_ADMIN)
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateEventDto,
  ) {
    return this.eventsService.update(user.companyId, id, dto);
  }

  @Put(':id/staff')
  @Roles(UserRole.COMPANY_ADMIN)
  async assignStaff(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: AssignStaffDto,
  ) {
    return this.eventsService.assignStaff(user.companyId, id, dto);
  }

  @Patch('assignments/:assignmentId')
  @Roles(UserRole.EMPLOYEE, UserRole.FREELANCER)
  async updateAssignmentStatus(
    @CurrentUser() user: any,
    @Param('assignmentId') assignmentId: string,
    @Body('status') status: AssignmentStatus,
  ) {
    return this.eventsService.updateAssignmentStatus(user.userId, assignmentId, status);
  }
}

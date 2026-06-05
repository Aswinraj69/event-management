import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { AssignmentStatus, UserRole } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateEventDto) {
    // Validate client belongs to company
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, companyId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const quotationAmount = dto.quotationAmount || 0;
    const additionalExpenses = dto.additionalExpenses || 0;
    const profit = quotationAmount - additionalExpenses;

    return this.prisma.event.create({
      data: {
        companyId,
        clientId: dto.clientId,
        title: dto.title,
        type: dto.type,
        venue: dto.venue,
        googleMapsUrl: dto.googleMapsUrl || null,
        eventDate: new Date(dto.eventDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        notes: dto.notes || null,
        quotationAmount,
        advanceAmount: dto.advanceAmount || 0,
        additionalExpenses,
        profit,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.event.findMany({
      where: { companyId },
      include: {
        client: true,
        staffAssignments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { eventDate: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        staffAssignments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async update(companyId: string, id: string, dto: CreateEventDto) {
    const event = await this.findOne(companyId, id);

    const quotationAmount = dto.quotationAmount !== undefined ? dto.quotationAmount : Number(event.quotationAmount);
    const additionalExpenses = dto.additionalExpenses !== undefined ? dto.additionalExpenses : Number(event.additionalExpenses);
    const profit = quotationAmount - additionalExpenses;

    return this.prisma.event.update({
      where: { id },
      data: {
        clientId: dto.clientId,
        title: dto.title,
        type: dto.type,
        venue: dto.venue,
        googleMapsUrl: dto.googleMapsUrl || null,
        eventDate: new Date(dto.eventDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        notes: dto.notes || null,
        quotationAmount,
        advanceAmount: dto.advanceAmount !== undefined ? dto.advanceAmount : Number(event.advanceAmount),
        additionalExpenses,
        profit,
      },
    });
  }

  async assignStaff(companyId: string, eventId: string, dto: AssignStaffDto) {
    const event = await this.findOne(companyId, eventId);

    // Verify staff members and check availability
    for (const assignment of dto.assignments) {
      const staffUser = await this.prisma.user.findFirst({
        where: { id: assignment.userId, companyId },
      });
      if (!staffUser) {
        throw new NotFoundException(`Staff user ${assignment.userId} not found in this company`);
      }

      // Check double booking: check if user is already assigned on the same event date
      const conflict = await this.prisma.eventStaffAssignment.findFirst({
        where: {
          userId: assignment.userId,
          status: { in: [AssignmentStatus.PENDING, AssignmentStatus.ACCEPTED] },
          event: {
            eventDate: event.eventDate,
            id: { not: eventId },
          },
        },
        include: { event: true },
      });

      if (conflict) {
        throw new BadRequestException(
          `Staff member ${staffUser.firstName} ${staffUser.lastName} is already assigned to event "${conflict.event.title}" on this date (${event.eventDate.toISOString().split('T')[0]})`
        );
      }
    }

    // In a transaction, delete old assignments and insert new ones
    return this.prisma.$transaction(async (tx) => {
      await tx.eventStaffAssignment.deleteMany({
        where: { eventId },
      });

      if (dto.assignments.length > 0) {
        await tx.eventStaffAssignment.createMany({
          data: dto.assignments.map(a => ({
            eventId,
            userId: a.userId,
            role: a.role,
            status: AssignmentStatus.PENDING,
          })),
        });
      }

      return tx.event.findUnique({
        where: { id: eventId },
        include: {
          staffAssignments: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
        },
      });
    });
  }

  async getStaffAssignments(userId: string) {
    return this.prisma.eventStaffAssignment.findMany({
      where: { userId },
      include: {
        event: {
          include: { client: true },
        },
      },
      orderBy: { event: { eventDate: 'asc' } },
    });
  }

  async updateAssignmentStatus(userId: string, assignmentId: string, status: AssignmentStatus) {
    const assignment = await this.prisma.eventStaffAssignment.findFirst({
      where: { id: assignmentId, userId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found or unauthorized');
    }

    return this.prisma.eventStaffAssignment.update({
      where: { id: assignmentId },
      data: { status },
    });
  }
}

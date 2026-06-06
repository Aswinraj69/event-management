import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AssignStaffDto } from './dto/assign-staff.dto';
import { AssignmentStatus, BookingStatus, EventType } from '@prisma/client';

const EVENT_INCLUDE = {
  client: true,
  staffAssignments: {
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  },
};

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateEventDto) {
    // If clientId provided, validate it belongs to this company
    if (dto.clientId) {
      const client = await this.prisma.client.findFirst({
        where: { id: dto.clientId, companyId },
      });
      if (!client) {
        throw new NotFoundException('Client not found');
      }
    }

    const quotationAmount = dto.quotationAmount ?? 0;
    const additionalExpenses = dto.additionalExpenses ?? 0;
    const profit = quotationAmount - additionalExpenses;

    return this.prisma.event.create({
      data: {
        companyId,
        clientId:           dto.clientId            || null,
        clientName:         dto.clientName           || null,
        clientPhone:        dto.clientPhone          || null,
        title:              dto.title               || 'Untitled Booking',
        type:               dto.type                ?? EventType.WEDDING,
        venue:              dto.venue               || null,
        googleMapsUrl:      dto.googleMapsUrl        || null,
        eventDate:          dto.eventDate            ? new Date(dto.eventDate) : null,
        startTime:          dto.startTime            || null,
        endTime:            dto.endTime              || null,
        notes:              dto.notes               || null,
        additionalNotes:    dto.additionalNotes      || null,
        bookingStatus:      dto.bookingStatus        ?? BookingStatus.UPCOMING,
        quotationAmount,
        advanceAmount:      dto.advanceAmount        ?? 0,
        additionalExpenses,
        profit,
      },
      include: EVENT_INCLUDE,
    });
  }

  async findAll(companyId: string) {
    return this.prisma.event.findMany({
      where: { companyId },
      include: EVENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, companyId },
      include: EVENT_INCLUDE,
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(companyId: string, id: string, dto: CreateEventDto) {
    const event = await this.findOne(companyId, id);

    if (dto.clientId) {
      const client = await this.prisma.client.findFirst({
        where: { id: dto.clientId, companyId },
      });
      if (!client) throw new NotFoundException('Client not found');
    }

    const quotationAmount    = dto.quotationAmount    !== undefined ? dto.quotationAmount    : Number(event.quotationAmount);
    const additionalExpenses = dto.additionalExpenses !== undefined ? dto.additionalExpenses : Number(event.additionalExpenses);
    const profit             = quotationAmount - additionalExpenses;

    return this.prisma.event.update({
      where: { id },
      data: {
        clientId:           dto.clientId         !== undefined ? dto.clientId || null          : event.clientId,
        clientName:         dto.clientName        !== undefined ? dto.clientName || null        : event.clientName,
        clientPhone:        dto.clientPhone       !== undefined ? dto.clientPhone || null       : event.clientPhone,
        title:              dto.title             !== undefined ? dto.title || event.title      : event.title,
        type:               dto.type              !== undefined ? dto.type                      : event.type,
        venue:              dto.venue             !== undefined ? dto.venue || null             : event.venue,
        googleMapsUrl:      dto.googleMapsUrl     !== undefined ? dto.googleMapsUrl || null     : event.googleMapsUrl,
        eventDate:          dto.eventDate         !== undefined ? (dto.eventDate ? new Date(dto.eventDate) : null) : event.eventDate,
        startTime:          dto.startTime         !== undefined ? dto.startTime || null         : event.startTime,
        endTime:            dto.endTime           !== undefined ? dto.endTime || null           : event.endTime,
        notes:              dto.notes             !== undefined ? dto.notes || null             : event.notes,
        additionalNotes:    dto.additionalNotes   !== undefined ? dto.additionalNotes || null   : event.additionalNotes,
        bookingStatus:      dto.bookingStatus     !== undefined ? dto.bookingStatus             : event.bookingStatus,
        quotationAmount,
        advanceAmount:      dto.advanceAmount     !== undefined ? dto.advanceAmount             : Number(event.advanceAmount),
        additionalExpenses,
        profit,
      },
      include: EVENT_INCLUDE,
    });
  }

  async delete(companyId: string, id: string) {
    await this.findOne(companyId, id);
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Booking deleted successfully' };
  }

  async assignStaff(companyId: string, eventId: string, dto: AssignStaffDto) {
    const event = await this.findOne(companyId, eventId);

    for (const assignment of dto.assignments) {
      const staffUser = await this.prisma.user.findFirst({
        where: { id: assignment.userId, companyId },
      });
      if (!staffUser) throw new NotFoundException(`Staff user ${assignment.userId} not found`);

      const conflict = await this.prisma.eventStaffAssignment.findFirst({
        where: {
          userId: assignment.userId,
          status: { in: [AssignmentStatus.PENDING, AssignmentStatus.ACCEPTED] },
          event: { eventDate: event.eventDate, id: { not: eventId } },
        },
        include: { event: true },
      });

      if (conflict && event.eventDate) {
        throw new BadRequestException(
          `${staffUser.firstName} ${staffUser.lastName} is already assigned to "${conflict.event.title}" on this date`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.eventStaffAssignment.deleteMany({ where: { eventId } });
      if (dto.assignments.length > 0) {
        await tx.eventStaffAssignment.createMany({
          data: dto.assignments.map((a) => ({
            eventId,
            userId: a.userId,
            role: a.role,
            status: AssignmentStatus.PENDING,
          })),
        });
      }
      return tx.event.findUnique({ where: { id: eventId }, include: EVENT_INCLUDE });
    });
  }

  async getStaffAssignments(userId: string) {
    return this.prisma.eventStaffAssignment.findMany({
      where: { userId },
      include: { event: { include: { client: true } } },
      orderBy: { event: { eventDate: 'asc' } },
    });
  }

  async updateAssignmentStatus(userId: string, assignmentId: string, status: AssignmentStatus) {
    const assignment = await this.prisma.eventStaffAssignment.findFirst({
      where: { id: assignmentId, userId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found or unauthorized');
    return this.prisma.eventStaffAssignment.update({ where: { id: assignmentId }, data: { status } });
  }
}

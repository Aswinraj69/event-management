import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, data: any) {
    return this.prisma.availability.create({
      data: {
        companyId,
        userId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reason: data.reason || null,
        status: data.status || 'APPROVED',
      },
    });
  }

  async findAll(companyId: string, userId?: string) {
    return this.prisma.availability.findMany({
      where: { 
        companyId,
        ...(userId ? { userId } : {})
      },
      include: {
        user: { select: { firstName: true, lastName: true, role: true } }
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async updateStatus(companyId: string, id: string, status: string) {
    const record = await this.prisma.availability.findFirst({
      where: { id, companyId },
    });
    if (!record) throw new NotFoundException('Availability record not found');

    return this.prisma.availability.update({
      where: { id },
      data: { status },
    });
  }

  async remove(companyId: string, userId: string, id: string, userRole: string) {
    const record = await this.prisma.availability.findFirst({
      where: { id, companyId },
    });
    if (!record) throw new NotFoundException('Record not found');

    // Only allow deletion if it belongs to user OR user is admin
    if (record.userId !== userId && userRole !== 'COMPANY_ADMIN') {
      throw new Error('Unauthorized to delete this record');
    }

    return this.prisma.availability.delete({
      where: { id },
    });
  }
}

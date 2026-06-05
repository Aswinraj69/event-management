import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VenuesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, data: any) {
    return this.prisma.venue.create({
      data: {
        companyId,
        name: data.name,
        address: data.address,
        capacity: Number(data.capacity) || null,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        notes: data.notes,
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.venue.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const venue = await this.prisma.venue.findFirst({
      where: { id, companyId },
    });
    if (!venue) throw new NotFoundException('Venue not found');
    return venue;
  }

  async update(companyId: string, id: string, data: any) {
    const venue = await this.findOne(companyId, id);
    return this.prisma.venue.update({
      where: { id: venue.id },
      data: {
        name: data.name,
        address: data.address,
        capacity: Number(data.capacity) || null,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        notes: data.notes,
      },
    });
  }

  async remove(companyId: string, id: string) {
    const venue = await this.findOne(companyId, id);
    return this.prisma.venue.delete({
      where: { id: venue.id },
    });
  }
}

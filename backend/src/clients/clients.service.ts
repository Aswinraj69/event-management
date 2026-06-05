import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        companyId,
        name: dto.name,
        phone: dto.phone || null,
        email: dto.email || null,
        address: dto.address || null,
        notes: dto.notes || null,
      },
    });
  }

  async findAll(companyId: string) {
    const clients = await this.prisma.client.findMany({
      where: { companyId },
      include: {
        events: {
          select: { id: true, title: true, eventDate: true },
        },
        invoices: {
          select: {
            totalAmount: true,
            status: true,
            payments: { select: { amount: true } },
          },
        },
        quotations: {
          select: { id: true, quotationNumber: true, status: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Compute metrics for each client
    return clients.map(client => {
      let totalBilled = 0;
      let totalPaid = 0;

      client.invoices.forEach(inv => {
        const amount = Number(inv.totalAmount);
        totalBilled += amount;
        
        inv.payments.forEach(p => {
          totalPaid += Number(p.amount);
        });
      });

      const outstandingBalance = totalBilled - totalPaid;

      return {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        address: client.address,
        notes: client.notes,
        createdAt: client.createdAt,
        eventsCount: client.events.length,
        quotationsCount: client.quotations.length,
        outstandingBalance,
        totalBilled,
        totalPaid,
      };
    });
  }

  async findOne(companyId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, companyId },
      include: {
        events: true,
        invoices: {
          include: { payments: true },
        },
        quotations: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    let totalBilled = 0;
    let totalPaid = 0;

    client.invoices.forEach(inv => {
      totalBilled += Number(inv.totalAmount);
      inv.payments.forEach(p => {
        totalPaid += Number(p.amount);
      });
    });

    return {
      ...client,
      totalBilled,
      totalPaid,
      outstandingBalance: totalBilled - totalPaid,
    };
  }

  async update(companyId: string, id: string, dto: CreateClientDto) {
    // Check client exists
    await this.findOne(companyId, id);

    return this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        notes: dto.notes,
      },
    });
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id);
    return this.prisma.client.delete({
      where: { id },
    });
  }
}

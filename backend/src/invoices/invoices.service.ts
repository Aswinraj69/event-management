import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { LogPaymentDto } from './dto/log-payment.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateInvoiceDto) {
    // Validate client belongs to company
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, companyId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Auto-generate numbering: INV-{YYYY}-{COUNT}
    const currentYear = new Date().getFullYear();
    const count = await this.prisma.invoice.count({
      where: { companyId },
    });
    const nextNum = (count + 1).toString().padStart(4, '0');
    const invoiceNumber = `INV-${currentYear}-${nextNum}`;

    // Calculations
    const subtotal = Number(dto.subtotal);
    const taxRate = Number(dto.taxRate !== undefined ? dto.taxRate : 5.00);
    const taxAmount = subtotal * (taxRate / 100);
    const discount = Number(dto.discount || 0);
    const totalAmount = subtotal + taxAmount - discount;

    // Generate mock QR Code Data (containing TLS/crypto mock payload or details)
    const qrCodeData = `EVENTO-INV|Company:${companyId}|Number:${invoiceNumber}|Total:${totalAmount.toFixed(2)}|VAT:${taxAmount.toFixed(2)}`;

    return this.prisma.invoice.create({
      data: {
        companyId,
        clientId: dto.clientId,
        eventId: dto.eventId || null,
        invoiceNumber,
        subtotal,
        taxRate,
        taxAmount,
        discount,
        totalAmount,
        dueDate: new Date(dto.dueDate),
        status: InvoiceStatus.PENDING,
        qrCodeData,
      },
      include: { client: true },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.invoice.findMany({
      where: { companyId },
      include: { client: true, event: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        event: true,
        company: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async logPayment(companyId: string, invoiceId: string, dto: LogPaymentDto) {
    const invoice = await this.findOne(companyId, invoiceId);

    // Create payment in transaction and update invoice status
    return this.prisma.$transaction(async (tx) => {
      // 1. Log payment
      await tx.payment.create({
        data: {
          companyId,
          invoiceId,
          amount: dto.amount,
          paymentMethod: dto.paymentMethod,
          referenceNumber: dto.referenceNumber || null,
        },
      });

      // 2. Fetch payments to recalculate status
      const payments = await tx.payment.findMany({
        where: { invoiceId },
      });

      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const totalInvoice = Number(invoice.totalAmount);

      let status: InvoiceStatus = InvoiceStatus.PENDING;
      if (totalPaid >= totalInvoice) {
        status = InvoiceStatus.PAID;
      } else if (totalPaid > 0) {
        status = InvoiceStatus.PARTIALLY_PAID;
      }

      // 3. Update invoice status
      return tx.invoice.update({
        where: { id: invoiceId },
        data: { status },
        include: { payments: true, client: true },
      });
    });
  }

  async getDashboardStats(companyId: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { companyId },
      include: { payments: true },
    });

    let totalRevenue = 0; // Cumulative payments received
    let totalOutstanding = 0; // Cumulative unpaid balance
    let paidInvoicesCount = 0;
    let pendingInvoicesCount = 0;

    invoices.forEach(inv => {
      const totalAmt = Number(inv.totalAmount);
      const paidAmt = inv.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const unpaidAmt = totalAmt - paidAmt;

      totalRevenue += paidAmt;
      totalOutstanding += unpaidAmt > 0 ? unpaidAmt : 0;

      if (inv.status === InvoiceStatus.PAID) {
        paidInvoicesCount++;
      } else {
        pendingInvoicesCount++;
      }
    });

    return {
      totalRevenue,
      totalOutstanding,
      paidInvoicesCount,
      pendingInvoicesCount,
      totalInvoicesCount: invoices.length,
    };
  }
}

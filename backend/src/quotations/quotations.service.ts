import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { QuotationStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class QuotationsService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateQuotationDto) {
    // Verify client belongs to company
    const client = await this.prisma.client.findFirst({
      where: { id: dto.clientId, companyId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Auto-generate numbering: QUO-{YYYY}-{COUNT}
    const currentYear = new Date().getFullYear();
    const count = await this.prisma.quotation.count({
      where: { companyId },
    });
    const nextNum = (count + 1).toString().padStart(4, '0');
    const quotationNumber = `QUO-${currentYear}-${nextNum}`;

    // Map and compute service item totals
    const servicesData = dto.services.map(s => ({
      description: s.description,
      quantity: Number(s.quantity),
      unitPrice: Number(s.unitPrice),
      totalPrice: Number(s.quantity) * Number(s.unitPrice),
    }));

    const magicLinkToken = crypto.randomBytes(32).toString('hex');

    return this.prisma.quotation.create({
      data: {
        companyId,
        clientId: dto.clientId,
        eventId: dto.eventId || null,
        quotationNumber,
        services: servicesData,
        termsConditions: dto.termsConditions || null,
        status: QuotationStatus.DRAFT,
        magicLinkToken,
      },
      include: { client: true },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.quotation.findMany({
      where: { companyId },
      include: { client: true, event: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        event: true,
        company: true, // Includes company profile details for logos and VAT rendering
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async updateStatus(companyId: string, id: string, status: QuotationStatus) {
    const quotation = await this.findOne(companyId, id);
    return this.prisma.quotation.update({
      where: { id: quotation.id },
      data: { status },
    });
  }

  async remove(companyId: string, id: string) {
    const quotation = await this.findOne(companyId, id);
    return this.prisma.quotation.delete({
      where: { id: quotation.id },
    });
  }

  async findByMagicLink(token: string) {
    const quotation = await this.prisma.quotation.findUnique({
      where: { magicLinkToken: token },
      include: {
        client: true,
        event: true,
        company: true,
      },
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found or link expired');
    }

    return quotation;
  }

  async signQuotation(token: string, signatureData: string) {
    const quotation = await this.findByMagicLink(token);

    if (quotation.status === QuotationStatus.ACCEPTED) {
      throw new Error('Quotation has already been accepted');
    }

    let signatureUrl = signatureData;

    // If signatureData is a base64 image and Supabase is configured, upload it
    if (signatureData.startsWith('data:image/') && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      // Extract base64 part
      const base64Data = signatureData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `signatures/${quotation.id}_${Date.now()}.png`;

      const { data, error } = await supabase.storage
        .from('evento-assets')
        .upload(filename, buffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (!error && data) {
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('evento-assets')
          .getPublicUrl(filename);
        
        signatureUrl = publicUrlData.publicUrl;
      } else {
        console.error('Failed to upload signature to Supabase', error);
      }
    }

    return this.prisma.quotation.update({
      where: { id: quotation.id },
      data: {
        status: QuotationStatus.ACCEPTED,
        signatureUrl,
        signedAt: new Date(),
      },
    });
  }
}

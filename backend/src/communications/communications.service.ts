import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(private prisma: PrismaService) {}

  async sendEmailStub(companyId: string, clientId: string, subject: string, content: string) {
    this.logger.log(`[EMAIL STUB] Sending to client ${clientId}: ${subject}`);
    // Simulate API call to SendGrid/AWS SES
    return this.prisma.communicationLog.create({
      data: {
        companyId,
        clientId,
        type: 'EMAIL',
        subject,
        content,
        status: 'DELIVERED', // Simulated success
      },
    });
  }

  async sendWhatsAppStub(companyId: string, clientId: string, message: string) {
    this.logger.log(`[WHATSAPP STUB] Sending to client ${clientId}: ${message}`);
    // Simulate API call to Twilio/WhatsApp Cloud API
    return this.prisma.communicationLog.create({
      data: {
        companyId,
        clientId,
        type: 'WHATSAPP',
        content: message,
        status: 'SENT', // Simulated sent status
      },
    });
  }
}

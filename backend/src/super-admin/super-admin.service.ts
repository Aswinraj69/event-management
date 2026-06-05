import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyStatus, UserRole, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  async listRegistrations() {
    return this.prisma.companyRegistration.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async listCompanies() {
    return this.prisma.company.findMany({
      include: {
        plan: true,
        subscription: true,
        _count: {
          select: { users: true, clients: true, events: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveRegistration(id: string) {
    const reg = await this.prisma.companyRegistration.findUnique({
      where: { id },
    });

    if (!reg) {
      throw new NotFoundException('Registration application not found');
    }

    if (reg.status !== CompanyStatus.PENDING) {
      throw new BadRequestException(`Application is already ${reg.status.toLowerCase()}`);
    }

    // Generate unique subdomain
    let subdomain = reg.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!subdomain) {
      subdomain = `company-${Date.now()}`;
    }

    // Check availability
    const existingCompany = await this.prisma.company.findUnique({
      where: { subdomain },
    });
    if (existingCompany) {
      subdomain = `${subdomain}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Ensure we have a default subscription plan
    let plan = await this.prisma.plan.findFirst({
      where: { name: 'Starter' },
    });

    if (!plan) {
      plan = await this.prisma.plan.create({
        data: {
          name: 'Starter',
          monthlyPrice: 99.00,
          yearlyPrice: 990.00,
          features: { maxEmployees: 10, maxEvents: 15, aiAssistant: false },
        },
      });
    }

    // Generate credentials
    const tempPassword = `Welcome123!`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const nameParts = reg.ownerName.split(' ');
    const firstName = nameParts[0] || 'Owner';
    const lastName = nameParts.slice(1).join(' ') || 'Admin';

    // Transaction to create company, user, subscription, and update registration
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Create company
      const company = await tx.company.create({
        data: {
          name: reg.companyName,
          subdomain,
          logoUrl: reg.logoUrl,
          status: CompanyStatus.APPROVED,
          planId: plan.id,
        },
      });

      // 2. Create user (Company Admin)
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          email: reg.email,
          phone: reg.phone,
          firstName,
          lastName,
          passwordHash,
          role: UserRole.COMPANY_ADMIN,
          isActive: true,
        },
      });

      // 3. Create active trial subscription (30 days)
      const now = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 30);

      await tx.subscription.create({
        data: {
          companyId: company.id,
          planId: plan.id,
          status: SubscriptionStatus.TRIALING,
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
        },
      });

      // 4. Update registration application
      await tx.companyRegistration.update({
        where: { id },
        data: { status: CompanyStatus.APPROVED },
      });

      return { company, user };
    });

    return {
      message: 'Company registration approved and tenant provisioned successfully',
      companyId: result.company.id,
      subdomain: result.company.subdomain,
      adminEmail: result.user.email,
      temporaryPassword: tempPassword,
    };
  }

  async rejectRegistration(id: string) {
    const reg = await this.prisma.companyRegistration.findUnique({
      where: { id },
    });

    if (!reg) {
      throw new NotFoundException('Registration application not found');
    }

    if (reg.status !== CompanyStatus.PENDING) {
      throw new BadRequestException(`Application is already ${reg.status.toLowerCase()}`);
    }

    return this.prisma.companyRegistration.update({
      where: { id },
      data: { status: CompanyStatus.DELETED },
    });
  }

  async toggleCompanyStatus(id: string, status: CompanyStatus) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company tenant not found');
    }

    return this.prisma.company.update({
      where: { id },
      data: { status },
    });
  }
}

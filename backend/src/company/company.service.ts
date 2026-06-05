import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UpdateBrandingDto {
  name?: string;
  logoUrl?: string;
  faviconUrl?: string;
  address?: string;
  vatNumber?: string;
  website?: string;
  socialLinks?: any;
  brandColors?: any;
}

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async getBranding(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { plan: true },
    });

    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    return company;
  }

  async updateBranding(companyId: string, dto: UpdateBrandingDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company profile not found');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        faviconUrl: dto.faviconUrl,
        address: dto.address,
        vatNumber: dto.vatNumber,
        website: dto.website,
        socialLinks: dto.socialLinks,
        brandColors: dto.brandColors,
      },
    });
  }

  async findBySubdomain(subdomain: string) {
    const company = await this.prisma.company.findUnique({
      where: { subdomain },
    });
    if (!company) {
      throw new NotFoundException(`Subdomain ${subdomain} not registered`);
    }
    return company;
  }
}

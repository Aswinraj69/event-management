import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import * as bcrypt from 'bcrypt';
import { UserRole, CompanyStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is suspended');
    }

    // Verify company status if user is linked to a tenant
    if (user.company && user.company.status !== CompanyStatus.APPROVED) {
      throw new UnauthorizedException(`Tenant company is ${user.company.status.toLowerCase()}`);
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto);
    
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company?.name || null,
        subdomain: user.company?.subdomain || null,
      },
    };
  }

  async registerCompany(dto: RegisterCompanyDto) {
    // Check if duplicate requests or existing domains exist
    const subdomain = dto.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!subdomain) {
      throw new BadRequestException('Invalid company name to generate subdomain');
    }

    const existingCompany = await this.prisma.company.findUnique({
      where: { subdomain },
    });
    if (existingCompany) {
      throw new BadRequestException('Subdomain name is already in use by another company');
    }

    const existingRequest = await this.prisma.companyRegistration.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { companyName: dto.companyName },
        ],
        status: CompanyStatus.PENDING,
      },
    });
    if (existingRequest) {
      throw new BadRequestException('A pending registration request already exists for this email or company');
    }

    return this.prisma.companyRegistration.create({
      data: {
        companyName: dto.companyName,
        ownerName: dto.ownerName,
        email: dto.email,
        phone: dto.phone,
        country: dto.country,
        city: dto.city,
        tradeLicenseUrl: dto.tradeLicenseUrl || null,
        logoUrl: dto.logoUrl || null,
        employeeCount: dto.employeeCount || 1,
        status: CompanyStatus.PENDING,
      },
    });
  }
}

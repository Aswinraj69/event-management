import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, dto: CreateEmployeeDto) {
    // Check email uniqueness
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new BadRequestException('Email is already registered on the platform');
    }

    // Default temp password
    const tempPassword = 'UserWelcome123!';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    // Create user and profile in transaction
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          companyId,
          email: dto.email,
          phone: dto.phone || null,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash,
          role: dto.role,
          isActive: true,
        },
      });

      const profile = await tx.employeeProfile.create({
        data: {
          userId: user.id,
          employeeId: dto.employeeId || null,
          gender: dto.gender || null,
          dob: dto.dob ? new Date(dto.dob) : null,
          nationality: dto.nationality || null,
          designation: dto.designation || null,
          employeeType: dto.employeeType,
          address: dto.address || null,
          skills: dto.skills || [],
          passportNumber: dto.passportNumber || null,
          passportExpiry: dto.passportExpiry ? new Date(dto.passportExpiry) : null,
          visaNumber: dto.visaNumber || null,
          visaExpiry: dto.visaExpiry ? new Date(dto.visaExpiry) : null,
          emiratesId: dto.emiratesId || null,
          drivingLicense: dto.drivingLicense || null,
          insuranceDetails: dto.insuranceDetails || null,
        },
      });

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        temporaryPassword: tempPassword,
        profile,
      };
    });
  }

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: {
        companyId,
        role: { in: [UserRole.EMPLOYEE, UserRole.FREELANCER] },
      },
      include: {
        employeeProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(companyId: string, id: string) {
    const employee = await this.prisma.user.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        employeeProfile: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found or unauthorized');
    }

    return employee;
  }

  async update(companyId: string, id: string, dto: UpdateEmployeeProfileDto) {
    const employee = await this.findOne(companyId, id);

    return this.prisma.$transaction(async (tx) => {
      // Update User table if name/phone changed
      const userUpdates: any = {};
      if (dto.firstName) userUpdates.firstName = dto.firstName;
      if (dto.lastName) userUpdates.lastName = dto.lastName;
      if (dto.phone !== undefined) userUpdates.phone = dto.phone;

      if (Object.keys(userUpdates).length > 0) {
        await tx.user.update({
          where: { id },
          data: userUpdates,
        });
      }

      // Prepare profile updates
      const profileUpdates: any = {};
      if (dto.employeeId !== undefined) profileUpdates.employeeId = dto.employeeId;
      if (dto.gender !== undefined) profileUpdates.gender = dto.gender;
      if (dto.dob !== undefined) profileUpdates.dob = dto.dob ? new Date(dto.dob) : null;
      if (dto.nationality !== undefined) profileUpdates.nationality = dto.nationality;
      if (dto.designation !== undefined) profileUpdates.designation = dto.designation;
      if (dto.employeeType !== undefined) profileUpdates.employeeType = dto.employeeType;
      if (dto.address !== undefined) profileUpdates.address = dto.address;
      if (dto.skills !== undefined) profileUpdates.skills = dto.skills;
      if (dto.passportNumber !== undefined) profileUpdates.passportNumber = dto.passportNumber;
      if (dto.passportExpiry !== undefined) profileUpdates.passportExpiry = dto.passportExpiry ? new Date(dto.passportExpiry) : null;
      if (dto.visaNumber !== undefined) profileUpdates.visaNumber = dto.visaNumber;
      if (dto.visaExpiry !== undefined) profileUpdates.visaExpiry = dto.visaExpiry ? new Date(dto.visaExpiry) : null;
      if (dto.emiratesId !== undefined) profileUpdates.emiratesId = dto.emiratesId;
      if (dto.drivingLicense !== undefined) profileUpdates.drivingLicense = dto.drivingLicense;
      if (dto.insuranceDetails !== undefined) profileUpdates.insuranceDetails = dto.insuranceDetails;

      if (Object.keys(profileUpdates).length > 0 && employee.employeeProfile) {
        await tx.employeeProfile.update({
          where: { id: employee.employeeProfile.id },
          data: profileUpdates,
        });
      }

      return tx.user.findUnique({
        where: { id },
        include: { employeeProfile: true },
      });
    });
  }

  async remove(companyId: string, id: string) {
    const employee = await this.findOne(companyId, id);
    // Deactivate employee rather than hard delete to retain event logs & calendar histories
    return this.prisma.user.update({
      where: { id: employee.id },
      data: { isActive: false },
    });
  }
}

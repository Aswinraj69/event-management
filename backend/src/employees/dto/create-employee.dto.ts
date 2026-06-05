import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsDateString } from 'class-validator';
import { UserRole, EmployeeType } from '@prisma/client';

export class CreateEmployeeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole; // EMPLOYEE or FREELANCER

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsDateString()
  @IsOptional()
  dob?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsString()
  @IsOptional()
  designation?: string;

  @IsEnum(EmployeeType)
  @IsNotEmpty()
  employeeType: EmployeeType;

  @IsString()
  @IsOptional()
  address?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @IsString()
  @IsOptional()
  passportNumber?: string;

  @IsDateString()
  @IsOptional()
  passportExpiry?: string;

  @IsString()
  @IsOptional()
  visaNumber?: string;

  @IsDateString()
  @IsOptional()
  visaExpiry?: string;

  @IsString()
  @IsOptional()
  emiratesId?: string;

  @IsString()
  @IsOptional()
  drivingLicense?: string;

  @IsString()
  @IsOptional()
  insuranceDetails?: string;
}

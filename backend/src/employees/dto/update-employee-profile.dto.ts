import { IsOptional, IsString, IsArray, IsDateString, IsEnum } from 'class-validator';
import { EmployeeType } from '@prisma/client';

export class UpdateEmployeeProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

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
  @IsOptional()
  employeeType?: EmployeeType;

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

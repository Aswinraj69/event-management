import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsArray, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole, EmployeeType } from '@prisma/client';

// Helper: treat empty string as undefined so @IsDateString() never rejects blank optional fields
const sanitizeDate = ({ value }: { value: any }) => (value === '' ? undefined : value);

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

  @Transform(sanitizeDate)
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

  @Transform(sanitizeDate)
  @IsDateString()
  @IsOptional()
  passportExpiry?: string;

  @IsString()
  @IsOptional()
  visaNumber?: string;

  @Transform(sanitizeDate)
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

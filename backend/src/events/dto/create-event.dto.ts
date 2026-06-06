import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EventType, BookingStatus } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(EventType)
  @IsOptional()
  type?: EventType;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  clientPhone?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  googleMapsUrl?: string;

  @IsDateString()
  @IsOptional()
  eventDate?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  additionalNotes?: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  bookingStatus?: BookingStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quotationAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  advanceAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  additionalExpenses?: number;
}

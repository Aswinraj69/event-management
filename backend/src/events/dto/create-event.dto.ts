import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EventType } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(EventType)
  @IsNotEmpty()
  type: EventType;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  venue: string;

  @IsString()
  @IsOptional()
  googleMapsUrl?: string;

  @IsDateString()
  @IsNotEmpty()
  eventDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string; // HH:MM

  @IsString()
  @IsNotEmpty()
  endTime: string; // HH:MM

  @IsString()
  @IsOptional()
  notes?: string;

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

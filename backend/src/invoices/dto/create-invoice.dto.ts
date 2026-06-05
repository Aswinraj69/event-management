import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  subtotal: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  taxRate?: number; // Defaults to 5% (VAT)

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount?: number;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}

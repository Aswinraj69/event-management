import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  quantity: number;

  @IsNotEmpty()
  unitPrice: number;
}

export class CreateQuotationDto {
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceItemDto)
  services: ServiceItemDto[];

  @IsString()
  @IsOptional()
  termsConditions?: string;
}

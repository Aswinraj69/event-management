import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class LogPaymentDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string; // e.g. Cash, Bank Transfer, Stripe

  @IsString()
  @IsOptional()
  referenceNumber?: string;
}

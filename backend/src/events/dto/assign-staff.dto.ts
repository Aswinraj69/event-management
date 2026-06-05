import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StaffAssignmentItemDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

export class AssignStaffDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StaffAssignmentItemDto)
  assignments: StaffAssignmentItemDto[];
}

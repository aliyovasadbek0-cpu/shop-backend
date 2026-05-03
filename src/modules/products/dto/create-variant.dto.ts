import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @MinLength(1)
  color: string;

  @IsString()
  @MinLength(1)
  size: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity?: number;
}

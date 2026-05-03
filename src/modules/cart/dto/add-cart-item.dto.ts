import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class AddCartItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @MinLength(1)
  selectedSize: string;

  @IsString()
  @MinLength(1)
  selectedColor: string;

  /** Birinchi marta bo‘sh bo‘lsa server yangi session qaytaradi */
  @IsOptional()
  @IsString()
  @MinLength(8)
  sessionId?: string;
}

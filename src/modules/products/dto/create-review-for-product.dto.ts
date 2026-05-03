import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReviewForProductDto {
  @IsString()
  @MinLength(1)
  userName: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(1)
  comment: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

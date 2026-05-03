import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Login faqat harf, raqam va pastki chiziq (_) dan iborat bo‘lishi kerak',
  })
  login: string;

  @IsString()
  @MinLength(6)
  password: string;
}

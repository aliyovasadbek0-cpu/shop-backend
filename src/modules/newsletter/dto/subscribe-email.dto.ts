import { IsEmail } from 'class-validator';

export class SubscribeEmailDto {
  @IsEmail()
  email: string;
}

import { IsEmail } from 'class-validator';

export class UpdateSubscriberDto {
  @IsEmail()
  email: string;
}

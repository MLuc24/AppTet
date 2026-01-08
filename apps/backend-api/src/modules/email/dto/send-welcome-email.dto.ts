import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendWelcomeEmailDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;
}

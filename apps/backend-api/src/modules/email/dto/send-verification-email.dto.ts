import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SendVerificationEmailDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  verificationLink?: string;
}

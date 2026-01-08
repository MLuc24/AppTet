import { IsEmail, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class SendResetOtpEmailDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @Length(6, 6)
  otpCode: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  expiresInMinutes?: number;
}

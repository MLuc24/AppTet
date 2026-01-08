-- Add password reset OTP fields to users
ALTER TABLE "auth"."users"
ADD COLUMN "password_reset_otp" VARCHAR(6),
ADD COLUMN "password_reset_otp_expires_at" TIMESTAMPTZ(6);

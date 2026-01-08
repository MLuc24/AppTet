-- Add email verified flag to users
ALTER TABLE "auth"."users"
ADD COLUMN "email_verified" BOOLEAN NOT NULL DEFAULT false;

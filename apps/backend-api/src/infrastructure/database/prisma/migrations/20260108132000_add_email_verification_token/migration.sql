-- Add email verification token to users
ALTER TABLE "auth"."users"
ADD COLUMN "email_verification_token" VARCHAR(255);

-- Unique index for verification token
CREATE UNIQUE INDEX "users_email_verification_token_key"
ON "auth"."users"("email_verification_token");

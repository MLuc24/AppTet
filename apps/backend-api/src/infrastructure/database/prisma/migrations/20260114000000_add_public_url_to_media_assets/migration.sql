-- Add public_url column to media_assets table
ALTER TABLE "content"."media_assets" ADD COLUMN "public_url" TEXT;

-- Add comment
COMMENT ON COLUMN "content"."media_assets"."public_url" IS 'Public URL for direct browser access (e.g., Cloudflare R2 public URL)';

-- Add cover_asset_id to courses table
-- This allows courses to have custom cover images

ALTER TABLE content.courses
ADD COLUMN cover_asset_id UUID;

-- Add foreign key constraint
ALTER TABLE content.courses
ADD CONSTRAINT fk_courses_cover_asset
FOREIGN KEY (cover_asset_id)
REFERENCES content.media_assets(asset_id)
ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_courses_cover_asset_id ON content.courses(cover_asset_id);

-- Add comment
COMMENT ON COLUMN content.courses.cover_asset_id IS 'Reference to media_assets table for course cover image';

-- Add user_id and status fields to resources for user submissions

-- Add user_id column (nullable to preserve existing admin-created resources)
ALTER TABLE resources ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Add status column for moderation
ALTER TABLE resources ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured'));

-- Set existing resources to 'approved' status since they were admin-created
UPDATE resources SET status = 'approved' WHERE status IS NULL OR status = 'pending';

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);

-- Update RLS policies
-- Allow users to insert their own resources
DROP POLICY IF EXISTS "Users can insert resources" ON resources;
CREATE POLICY "Users can insert resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own resources
DROP POLICY IF EXISTS "Users can update own resources" ON resources;
CREATE POLICY "Users can update own resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own resources
DROP POLICY IF EXISTS "Users can delete own resources" ON resources;
CREATE POLICY "Users can delete own resources"
  ON resources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public can read approved/featured resources
DROP POLICY IF EXISTS "Anyone can read approved resources" ON resources;
CREATE POLICY "Anyone can read approved resources"
  ON resources FOR SELECT
  USING (status IN ('approved', 'featured') OR auth.uid() = user_id);

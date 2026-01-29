-- Add created_by column to grants table to track who created the grant
ALTER TABLE grants ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS grants_created_by_idx ON grants(created_by);

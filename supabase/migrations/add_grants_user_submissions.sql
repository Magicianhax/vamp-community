-- Allow users to create and manage their own grants

-- Update RLS policies for grants

-- Allow users to insert their own grants
DROP POLICY IF EXISTS "Users can insert grants" ON grants;
CREATE POLICY "Users can insert grants"
  ON grants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own grants
DROP POLICY IF EXISTS "Users can update own grants" ON grants;
CREATE POLICY "Users can update own grants"
  ON grants FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow users to delete their own grants
DROP POLICY IF EXISTS "Users can delete own grants" ON grants;
CREATE POLICY "Users can delete own grants"
  ON grants FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Public can read active/completed grants, owners can see their own drafts
DROP POLICY IF EXISTS "Anyone can read public grants" ON grants;
CREATE POLICY "Anyone can read public grants"
  ON grants FOR SELECT
  USING (status IN ('active', 'closed', 'completed') OR auth.uid() = created_by);

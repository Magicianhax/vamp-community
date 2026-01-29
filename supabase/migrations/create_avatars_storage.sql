-- Create avatars storage bucket
-- This migration creates the storage bucket and sets up policies for avatar storage

-- Create the bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket so images can be accessed
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Allow public read access to all avatars
DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
CREATE POLICY "Public Avatar Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Allow authenticated users to upload their own avatars
-- Files are stored as: {userId}/{handle}.{ext} within the avatars bucket
-- Note: This allows server-side uploads (service role) and authenticated user uploads
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (
    auth.role() = 'service_role'
    OR auth.uid()::text = (string_to_array(name, '/'))[1]
  )
);

-- Policy 3: Allow authenticated users to update their own avatars
-- Also allow service role for server-side updates
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (
    auth.role() = 'service_role'
    OR auth.uid()::text = (string_to_array(name, '/'))[1]
  )
);

-- Policy 4: Allow authenticated users to delete their own avatars
-- Also allow service role for server-side deletes
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (
    auth.role() = 'service_role'
    OR auth.uid()::text = (string_to_array(name, '/'))[1]
  )
);

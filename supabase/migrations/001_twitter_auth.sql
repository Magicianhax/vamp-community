-- Migration: Update for Twitter/X OAuth only authentication
-- Run this in Supabase SQL Editor AFTER the initial schema

-- Make email nullable since Twitter might not provide it
ALTER TABLE public.users ALTER COLUMN email DROP NOT NULL;

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function to handle Twitter OAuth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  twitter_username TEXT;
  twitter_name TEXT;
  twitter_avatar TEXT;
  user_email TEXT;
BEGIN
  -- Extract Twitter data from user metadata
  twitter_username := NEW.raw_user_meta_data->>'user_name';
  twitter_name := NEW.raw_user_meta_data->>'name';
  twitter_avatar := NEW.raw_user_meta_data->>'avatar_url';
  user_email := NEW.email;

  -- Insert the new user profile
  INSERT INTO public.users (
    id,
    email,
    username,
    display_name,
    avatar_url,
    twitter_handle
  )
  VALUES (
    NEW.id,
    user_email,
    COALESCE(twitter_username, split_part(COALESCE(user_email, NEW.id::text), '@', 1)),
    COALESCE(twitter_name, twitter_username, 'User'),
    twitter_avatar,
    twitter_username
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

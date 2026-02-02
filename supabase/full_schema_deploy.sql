-- =============================================================================
-- Vamp Community - Full database schema for deployment
-- Run this in Supabase Dashboard → SQL Editor for a fresh project.
-- Tables are in dependency order (grants before projects, etc.).
-- =============================================================================

-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Users (references auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  twitter_handle TEXT,
  github_handle TEXT,
  website TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. Grants (no ref to projects; referenced by projects)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT NOT NULL,
  prize_amount TEXT NOT NULL,
  requirements TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  sponsor_twitter_url TEXT,
  tweet_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'completed')),
  created_by UUID REFERENCES public.users(id),
  comment_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. Projects (references users, grants)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  demo_url TEXT NOT NULL,
  github_url TEXT,
  thumbnail_url TEXT,
  logo_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  grant_id UUID REFERENCES public.grants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. Resources (Learn section; optional user_id for submissions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tutorial', 'tool', 'expert', 'article', 'video')),
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  ai_tool_type TEXT CHECK (ai_tool_type IN ('code-assistant', 'image-generator', 'text-generator', 'design-tool', 'video-generator', 'audio-generator', 'data-analysis', 'other')),
  pricing TEXT CHECK (pricing IN ('free', 'freemium', 'paid', 'open-source')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
  comment_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_user_id ON public.resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);

-- -----------------------------------------------------------------------------
-- 5. Upvotes (projects)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  project_id UUID REFERENCES public.projects(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- -----------------------------------------------------------------------------
-- 6. Downvotes (projects)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.downvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  project_id UUID REFERENCES public.projects(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- -----------------------------------------------------------------------------
-- 7. Grant submissions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.grant_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES public.grants(id) NOT NULL,
  project_id UUID REFERENCES public.projects(id) NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  pitch TEXT NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'winner', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. Comments (grants, projects, or resources; parent_id for replies)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  grant_id UUID REFERENCES public.grants(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT comments_entity_check CHECK (
    (grant_id IS NOT NULL AND project_id IS NULL AND resource_id IS NULL) OR
    (project_id IS NOT NULL AND grant_id IS NULL AND resource_id IS NULL) OR
    (resource_id IS NOT NULL AND grant_id IS NULL AND project_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS comments_grant_id_idx ON public.comments(grant_id);
CREATE INDEX IF NOT EXISTS comments_project_id_idx ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS comments_resource_id_idx ON public.comments(resource_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);

-- -----------------------------------------------------------------------------
-- 9. Resource votes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resource_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resource_id, user_id)
);

CREATE INDEX IF NOT EXISTS resource_votes_resource_id_idx ON public.resource_votes(resource_id);
CREATE INDEX IF NOT EXISTS resource_votes_user_id_idx ON public.resource_votes(user_id);

-- -----------------------------------------------------------------------------
-- 10. Notifications
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment_reply', 'project_comment', 'grant_comment', 'grant_submission', 'project_approved', 'grant_winner')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public read grants" ON public.grants FOR SELECT USING (status IN ('active', 'closed', 'completed') OR auth.uid() = created_by);
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (status IN ('approved', 'featured') OR auth.uid() = user_id);
CREATE POLICY "Public read resources" ON public.resources FOR SELECT USING (status IN ('approved', 'featured') OR auth.uid() = user_id);
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public read upvotes" ON public.upvotes FOR SELECT USING (true);
CREATE POLICY "Public read downvotes" ON public.downvotes FOR SELECT USING (true);
CREATE POLICY "Public read resource_votes" ON public.resource_votes FOR SELECT USING (true);

-- Users
CREATE POLICY "Users update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);

-- Grants
CREATE POLICY "Users create grants" ON public.grants FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users update own grants" ON public.grants FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users delete own grants" ON public.grants FOR DELETE USING (auth.uid() = created_by);

-- Resources
CREATE POLICY "Users insert resources" ON public.resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own resources" ON public.resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own resources" ON public.resources FOR DELETE USING (auth.uid() = user_id);

-- Upvotes / downvotes
CREATE POLICY "Users insert upvotes" ON public.upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own upvotes" ON public.upvotes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users insert downvotes" ON public.downvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own downvotes" ON public.downvotes FOR DELETE USING (auth.uid() = user_id);

-- Grant submissions (authenticated insert; read own or public grant context)
CREATE POLICY "Users insert grant_submissions" ON public.grant_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read grant_submissions" ON public.grant_submissions FOR SELECT USING (true);
CREATE POLICY "Users update own grant_submissions" ON public.grant_submissions FOR UPDATE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Users insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Resource votes
CREATE POLICY "Users insert resource_votes" ON public.resource_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own resource_votes" ON public.resource_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own resource_votes" ON public.resource_votes FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- =============================================================================
-- Triggers (comment counts, downvote count, notification on reply)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.grant_id IS NOT NULL THEN
      UPDATE public.grants SET comment_count = comment_count + 1 WHERE id = NEW.grant_id;
    ELSIF NEW.project_id IS NOT NULL THEN
      UPDATE public.projects SET comment_count = comment_count + 1 WHERE id = NEW.project_id;
    ELSIF NEW.resource_id IS NOT NULL THEN
      UPDATE public.resources SET comment_count = comment_count + 1 WHERE id = NEW.resource_id;
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.grant_id IS NOT NULL THEN
      UPDATE public.grants SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.grant_id;
    ELSIF OLD.project_id IS NOT NULL THEN
      UPDATE public.projects SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.project_id;
    ELSIF OLD.resource_id IS NOT NULL THEN
      UPDATE public.resources SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.resource_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_change ON public.comments;
CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comment_count();

-- Downvote count on projects
CREATE OR REPLACE FUNCTION public.update_downvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.projects SET downvote_count = downvote_count + 1 WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.projects SET downvote_count = GREATEST(0, downvote_count - 1) WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_downvote_change ON public.downvotes;
CREATE TRIGGER on_downvote_change
  AFTER INSERT OR DELETE ON public.downvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_downvote_count();

-- Notify on comment reply
CREATE OR REPLACE FUNCTION public.notify_on_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  parent_comment RECORD;
  commenter RECORD;
  target_link TEXT;
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    SELECT * INTO parent_comment FROM public.comments WHERE id = NEW.parent_id;
    IF parent_comment.user_id = NEW.user_id THEN
      RETURN NEW;
    END IF;
    SELECT display_name, username INTO commenter FROM public.users WHERE id = NEW.user_id;
    IF NEW.grant_id IS NOT NULL THEN
      target_link := '/grants/' || NEW.grant_id || '#comments';
    ELSIF NEW.project_id IS NOT NULL THEN
      target_link := '/projects/' || NEW.project_id || '#comments';
    ELSIF NEW.resource_id IS NOT NULL THEN
      target_link := '/learn#comments';
    ELSE
      target_link := NULL;
    END IF;
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      parent_comment.user_id,
      'comment_reply',
      'New reply to your comment',
      COALESCE(commenter.display_name, commenter.username, 'Someone') || ' replied: "' || LEFT(NEW.body, 100) || CASE WHEN LENGTH(NEW.body) > 100 THEN '...' ELSE '' END || '"',
      target_link,
      jsonb_build_object('comment_id', NEW.id, 'parent_id', NEW.parent_id, 'replier_id', NEW.user_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_reply ON public.comments;
CREATE TRIGGER on_comment_reply
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment_reply();

-- =============================================================================
-- Storage buckets (avatars, images)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Avatar Access" ON storage.objects;
CREATE POLICY "Public Avatar Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
CREATE POLICY "Users can upload own avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND (auth.role() = 'service_role' OR auth.uid()::text = (string_to_array(name, '/'))[1])
);
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND (auth.role() = 'service_role' OR auth.uid()::text = (string_to_array(name, '/'))[1])
);
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND (auth.role() = 'service_role' OR auth.uid()::text = (string_to_array(name, '/'))[1])
);

DROP POLICY IF EXISTS "Public Image Access" ON storage.objects;
CREATE POLICY "Public Image Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'images' AND auth.role() = 'authenticated'
);
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text
);
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (
  bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text
);

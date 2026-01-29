-- Grants: gallery images (slideshow)
ALTER TABLE public.grants ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Grants: comment count for list display
ALTER TABLE public.grants ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0 NOT NULL;

-- Projects: downvote and comment counts
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS downvote_count integer DEFAULT 0 NOT NULL;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0 NOT NULL;

-- Downvotes (projects only, like upvotes)
CREATE TABLE IF NOT EXISTS public.downvotes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES public.projects ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, project_id)
);

ALTER TABLE public.downvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Downvotes are viewable by everyone"
  ON public.downvotes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert downvotes"
  ON public.downvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own downvotes"
  ON public.downvotes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS downvotes_project_id_idx ON public.downvotes(project_id);
CREATE INDEX IF NOT EXISTS downvotes_user_id_idx ON public.downvotes(user_id);

-- Comments (grants and projects; parent_id for replies)
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  grant_id uuid REFERENCES public.grants ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments ON DELETE CASCADE,
  user_id uuid REFERENCES public.users ON DELETE CASCADE NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT comments_entity_check CHECK (
    (grant_id IS NOT NULL AND project_id IS NULL) OR
    (project_id IS NOT NULL AND grant_id IS NULL)
  )
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS comments_grant_id_idx ON public.comments(grant_id);
CREATE INDEX IF NOT EXISTS comments_project_id_idx ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS comments_parent_id_idx ON public.comments(parent_id);

-- Trigger: update project downvote_count
CREATE OR REPLACE FUNCTION public.update_downvote_count()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.projects SET downvote_count = downvote_count + 1 WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.projects SET downvote_count = downvote_count - 1 WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_downvote_change ON public.downvotes;
CREATE TRIGGER on_downvote_change
  AFTER INSERT OR DELETE ON public.downvotes
  FOR EACH ROW EXECUTE PROCEDURE public.update_downvote_count();

-- Trigger: update grant comment_count and project comment_count
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF NEW.grant_id IS NOT NULL THEN
      UPDATE public.grants SET comment_count = comment_count + 1 WHERE id = NEW.grant_id;
    END IF;
    IF NEW.project_id IS NOT NULL THEN
      UPDATE public.projects SET comment_count = comment_count + 1 WHERE id = NEW.project_id;
    END IF;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    IF OLD.grant_id IS NOT NULL THEN
      UPDATE public.grants SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.grant_id;
    END IF;
    IF OLD.project_id IS NOT NULL THEN
      UPDATE public.projects SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.project_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_comment_change ON public.comments;
CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE PROCEDURE public.update_comment_count();

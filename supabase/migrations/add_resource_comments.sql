-- Add resource_id to comments table for article/guide comments
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS resource_id uuid REFERENCES public.resources(id) ON DELETE CASCADE;

-- Update constraint to allow resource_id
ALTER TABLE public.comments 
DROP CONSTRAINT IF EXISTS comments_entity_check;

ALTER TABLE public.comments 
ADD CONSTRAINT comments_entity_check CHECK (
  (grant_id IS NOT NULL AND project_id IS NULL AND resource_id IS NULL) OR
  (project_id IS NOT NULL AND grant_id IS NULL AND resource_id IS NULL) OR
  (resource_id IS NOT NULL AND grant_id IS NULL AND project_id IS NULL)
);

-- Add index for resource comments
CREATE INDEX IF NOT EXISTS comments_resource_id_idx ON public.comments(resource_id);

-- Add comment_count to resources table
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0 NOT NULL;

-- Update comment count trigger to handle resources
CREATE OR REPLACE FUNCTION public.update_comment_count()
RETURNS trigger AS $$
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

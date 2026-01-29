-- Create resource_votes table for upvoting/downvoting guides and articles
CREATE TABLE IF NOT EXISTS public.resource_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(resource_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS resource_votes_resource_id_idx ON public.resource_votes(resource_id);
CREATE INDEX IF NOT EXISTS resource_votes_user_id_idx ON public.resource_votes(user_id);
CREATE INDEX IF NOT EXISTS resource_votes_resource_user_idx ON public.resource_votes(resource_id, user_id);

-- Enable RLS
ALTER TABLE public.resource_votes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all votes
DROP POLICY IF EXISTS "Users can view all votes" ON public.resource_votes;
CREATE POLICY "Users can view all votes"
  ON public.resource_votes FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own votes
DROP POLICY IF EXISTS "Users can insert own votes" ON public.resource_votes;
CREATE POLICY "Users can insert own votes"
  ON public.resource_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own votes
DROP POLICY IF EXISTS "Users can update own votes" ON public.resource_votes;
CREATE POLICY "Users can update own votes"
  ON public.resource_votes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own votes
DROP POLICY IF EXISTS "Users can delete own votes" ON public.resource_votes;
CREATE POLICY "Users can delete own votes"
  ON public.resource_votes FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resource_votes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_resource_votes_updated_at
  BEFORE UPDATE ON public.resource_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_votes_updated_at();

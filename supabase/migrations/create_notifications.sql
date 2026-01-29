-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment_reply', 'project_comment', 'grant_comment', 'grant_submission', 'project_approved', 'grant_winner')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- System can insert notifications (using service role or trigger)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to create notification on comment reply
CREATE OR REPLACE FUNCTION notify_on_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  parent_comment RECORD;
  commenter RECORD;
  target_link TEXT;
BEGIN
  -- Only process if this is a reply (has parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    -- Get the parent comment
    SELECT * INTO parent_comment FROM public.comments WHERE id = NEW.parent_id;

    -- Don't notify if replying to own comment
    IF parent_comment.user_id = NEW.user_id THEN
      RETURN NEW;
    END IF;

    -- Get the commenter's info
    SELECT display_name, username INTO commenter FROM public.users WHERE id = NEW.user_id;

    -- Determine the link based on where the comment is
    IF NEW.grant_id IS NOT NULL THEN
      target_link := '/grants/' || NEW.grant_id || '#comments';
    ELSIF NEW.project_id IS NOT NULL THEN
      target_link := '/projects/' || NEW.project_id || '#comments';
    ELSIF NEW.resource_id IS NOT NULL THEN
      target_link := '/learn#comments';
    END IF;

    -- Create the notification
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

-- Create trigger for comment replies
DROP TRIGGER IF EXISTS on_comment_reply ON public.comments;
CREATE TRIGGER on_comment_reply
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment_reply();

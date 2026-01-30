-- Fix notification trigger to ensure it works for all nested replies

-- Drop and recreate the function with better error handling
CREATE OR REPLACE FUNCTION notify_on_comment_reply()
RETURNS TRIGGER AS $$
DECLARE
  parent_comment RECORD;
  commenter RECORD;
  target_link TEXT;
BEGIN
  -- Only process if this is a reply (has parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    -- Get the parent comment (this works for any level of nesting)
    SELECT c.*, u.display_name as parent_author_name, u.username as parent_author_username
    INTO parent_comment
    FROM public.comments c
    JOIN public.users u ON u.id = c.user_id
    WHERE c.id = NEW.parent_id;

    -- Exit if parent comment not found
    IF parent_comment IS NULL THEN
      RETURN NEW;
    END IF;

    -- Don't notify if replying to own comment
    IF parent_comment.user_id = NEW.user_id THEN
      RETURN NEW;
    END IF;

    -- Get the commenter's info (the person who is replying)
    SELECT display_name, username INTO commenter FROM public.users WHERE id = NEW.user_id;

    -- Determine the link based on where the comment is
    IF NEW.grant_id IS NOT NULL THEN
      target_link := '/grants/' || NEW.grant_id || '#comments';
    ELSIF NEW.project_id IS NOT NULL THEN
      target_link := '/projects/' || NEW.project_id || '#comments';
    ELSIF NEW.resource_id IS NOT NULL THEN
      target_link := '/learn#comments';
    ELSE
      target_link := NULL;
    END IF;

    -- Create the notification for the parent comment author
    INSERT INTO public.notifications (user_id, type, title, message, link, metadata)
    VALUES (
      parent_comment.user_id,
      'comment_reply',
      'New reply to your comment',
      COALESCE(commenter.display_name, commenter.username, 'Someone') || ' replied: "' || LEFT(NEW.body, 100) || CASE WHEN LENGTH(NEW.body) > 100 THEN '...' ELSE '' END || '"',
      target_link,
      jsonb_build_object(
        'comment_id', NEW.id::text,
        'parent_id', NEW.parent_id::text,
        'replier_id', NEW.user_id::text
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the comment insert
    RAISE WARNING 'notify_on_comment_reply failed: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS on_comment_reply ON public.comments;
CREATE TRIGGER on_comment_reply
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment_reply();

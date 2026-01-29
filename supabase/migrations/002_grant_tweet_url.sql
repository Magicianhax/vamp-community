-- Add tweet_url column to grants table
ALTER TABLE grants ADD COLUMN IF NOT EXISTS tweet_url TEXT;

-- Update existing grant with tweet URL and new deadline
UPDATE grants
SET
  tweet_url = 'https://x.com/KSimback/status/2016190180026102039?s=20',
  deadline = '2026-01-29T17:00:00.000Z'
WHERE status = 'active';

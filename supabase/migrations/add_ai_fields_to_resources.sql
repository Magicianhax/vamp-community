-- Add AI-related fields to resources table
-- This migration adds tags, ai_tool_type, pricing, and difficulty fields

-- Add tags array field
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Add ai_tool_type field (optional, for AI tools)
CREATE TYPE ai_tool_type AS ENUM (
  'code-assistant',
  'image-generator',
  'text-generator',
  'design-tool',
  'video-generator',
  'audio-generator',
  'data-analysis',
  'other'
);

ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS ai_tool_type ai_tool_type;

-- Add pricing field
CREATE TYPE resource_pricing AS ENUM (
  'free',
  'freemium',
  'paid',
  'open-source'
);

ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS pricing resource_pricing;

-- Add difficulty field
CREATE TYPE resource_difficulty AS ENUM (
  'beginner',
  'intermediate',
  'advanced'
);

ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS difficulty resource_difficulty;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS resources_tags_idx ON public.resources USING GIN(tags);
CREATE INDEX IF NOT EXISTS resources_ai_tool_type_idx ON public.resources(ai_tool_type);
CREATE INDEX IF NOT EXISTS resources_pricing_idx ON public.resources(pricing);
CREATE INDEX IF NOT EXISTS resources_difficulty_idx ON public.resources(difficulty);

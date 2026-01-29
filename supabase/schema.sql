-- Vamp Community Web App - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique,  -- nullable for OAuth users
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  twitter_handle text,
  github_handle text,
  website text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.users enable row level security;

-- Users policies
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using (true);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- ============================================
-- GRANTS TABLE
-- ============================================
create type grant_status as enum ('draft', 'active', 'closed', 'completed');

create table public.grants (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  short_description text,
  description text not null,
  prize_amount text not null,
  requirements text not null,
  deadline timestamp with time zone not null,
  sponsor_name text not null,
  sponsor_logo_url text,
  sponsor_twitter_url text,
  tweet_url text,
  status grant_status default 'draft' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.grants enable row level security;

-- Grants policies
create policy "Grants are viewable by everyone"
  on public.grants for select
  using (true);

create policy "Only admins can insert grants"
  on public.grants for insert
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

create policy "Only admins can update grants"
  on public.grants for update
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

create policy "Only admins can delete grants"
  on public.grants for delete
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

-- ============================================
-- PROJECTS TABLE
-- ============================================
create type project_status as enum ('pending', 'approved', 'rejected', 'featured');

create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null,
  tagline text not null,
  description text not null,
  demo_url text not null,
  github_url text not null,
  thumbnail_url text,
  tags text[] default '{}',
  status project_status default 'pending' not null,
  upvote_count integer default 0 not null,
  grant_id uuid references public.grants on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.projects enable row level security;

-- Projects policies
create policy "Approved projects are viewable by everyone"
  on public.projects for select
  using (
    status in ('approved', 'featured')
    or user_id = auth.uid()
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

create policy "Authenticated users can insert projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

create policy "Users can delete own projects"
  on public.projects for delete
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

-- ============================================
-- UPVOTES TABLE
-- ============================================
create table public.upvotes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  project_id uuid references public.projects on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, project_id)
);

-- Enable RLS
alter table public.upvotes enable row level security;

-- Upvotes policies
create policy "Upvotes are viewable by everyone"
  on public.upvotes for select
  using (true);

create policy "Authenticated users can insert upvotes"
  on public.upvotes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own upvotes"
  on public.upvotes for delete
  using (auth.uid() = user_id);

-- ============================================
-- RESOURCES TABLE
-- ============================================
create type resource_category as enum ('tutorial', 'tool', 'expert', 'article', 'video');

create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  url text not null,
  category resource_category not null,
  thumbnail_url text,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.resources enable row level security;

-- Resources policies
create policy "Resources are viewable by everyone"
  on public.resources for select
  using (true);

create policy "Only admins can manage resources"
  on public.resources for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

-- ============================================
-- GRANT SUBMISSIONS TABLE
-- ============================================
create type submission_status as enum ('submitted', 'under_review', 'winner', 'rejected');

create table public.grant_submissions (
  id uuid default uuid_generate_v4() primary key,
  grant_id uuid references public.grants on delete cascade not null,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  pitch text not null,
  status submission_status default 'submitted' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(grant_id, project_id)
);

-- Enable RLS
alter table public.grant_submissions enable row level security;

-- Grant submissions policies
create policy "Users can view own submissions"
  on public.grant_submissions for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

create policy "Authenticated users can submit"
  on public.grant_submissions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own submissions"
  on public.grant_submissions for update
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.users
      where users.id = auth.uid() and users.is_admin = true
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to handle new user signup (Twitter/X OAuth)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  twitter_username text;
  twitter_name text;
  twitter_avatar text;
  user_email text;
begin
  -- Extract Twitter data from user metadata
  twitter_username := new.raw_user_meta_data->>'user_name';
  twitter_name := new.raw_user_meta_data->>'name';
  twitter_avatar := new.raw_user_meta_data->>'avatar_url';
  user_email := new.email;

  -- Insert the new user profile
  insert into public.users (
    id,
    email,
    username,
    display_name,
    avatar_url,
    twitter_handle
  )
  values (
    new.id,
    user_email,
    coalesce(twitter_username, split_part(coalesce(user_email, new.id::text), '@', 1)),
    coalesce(twitter_name, twitter_username, 'User'),
    twitter_avatar,
    twitter_username
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update upvote count
create or replace function public.update_upvote_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.projects
    set upvote_count = upvote_count + 1
    where id = NEW.project_id;
    return NEW;
  elsif (TG_OP = 'DELETE') then
    update public.projects
    set upvote_count = upvote_count - 1
    where id = OLD.project_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Trigger for upvote count
create or replace trigger on_upvote_change
  after insert or delete on public.upvotes
  for each row execute procedure public.update_upvote_count();

-- Function to update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = timezone('utc'::text, now());
  return NEW;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_users_updated_at
  before update on public.users
  for each row execute procedure public.update_updated_at();

create trigger update_projects_updated_at
  before update on public.projects
  for each row execute procedure public.update_updated_at();

create trigger update_grants_updated_at
  before update on public.grants
  for each row execute procedure public.update_updated_at();

create trigger update_resources_updated_at
  before update on public.resources
  for each row execute procedure public.update_updated_at();

create trigger update_grant_submissions_updated_at
  before update on public.grant_submissions
  for each row execute procedure public.update_updated_at();

-- ============================================
-- INDEXES
-- ============================================
create index projects_user_id_idx on public.projects(user_id);
create index projects_status_idx on public.projects(status);
create index projects_created_at_idx on public.projects(created_at desc);
create index projects_upvote_count_idx on public.projects(upvote_count desc);
create index upvotes_user_id_idx on public.upvotes(user_id);
create index upvotes_project_id_idx on public.upvotes(project_id);
create index grants_status_idx on public.grants(status);
create index grants_deadline_idx on public.grants(deadline);
create index resources_category_idx on public.resources(category);
create index grant_submissions_grant_id_idx on public.grant_submissions(grant_id);
create index grant_submissions_user_id_idx on public.grant_submissions(user_id);

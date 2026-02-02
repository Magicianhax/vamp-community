# Vamp - The Vibecoding Community Platform

Vamp is a community-driven platform built for **vibecoders** - developers who embrace AI-assisted coding to build, ship, and share their projects. Think of it as Product Hunt meets Hacker News, but specifically designed for the vibecoding movement.

## Table of Contents

- [What is Vibecoding?](#what-is-vibecoding)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## What is Vibecoding?

Vibecoding is a development philosophy that embraces AI coding assistants as core tools in the software development workflow. Instead of writing every line of code manually, vibecoders leverage tools like:

- **Cursor** - AI-powered code editor with codebase understanding
- **GitHub Copilot** - Real-time autocomplete and inline suggestions
- **Claude Code** - Large refactoring and architectural work
- **ChatGPT** - Learning, debugging, and general coding help

The result? Faster prototyping, rapid iteration, and the ability to ship products in hours instead of weeks.

---

## Features

### Projects

The heart of Vamp - a curated showcase of vibecoded projects.

- **Submit Projects**: Share your vibecoded creations with the community
- **Voting System**: Upvote and downvote projects to surface the best work
- **Rich Details**: Demo URLs, GitHub repositories, descriptions, and thumbnails
- **Tagging**: Categorize projects with tags for easy discovery
- **Status Workflow**: Projects go through pending → approved → featured states
- **Creator Attribution**: Each project links to the creator's profile

### Grants

Bounty programs for vibecoders to compete and win prizes.

- **Active Grants**: Browse open grants with prize pools
- **Submit to Grants**: Link your project to compete for prizes
- **Grant Details**: Requirements, deadlines, prize amounts
- **Winner Showcase**: Winning submissions displayed on grant pages
- **Creator Profiles**: Grant sponsors get profile attribution with avatars
- **Comments**: Discuss grants with the community

### Learn

Curated educational resources and AI tools directory.

- **Resource Categories**: Tutorials, articles, videos, tools, expert content
- **AI Tools Directory**: Comprehensive list of AI coding tools
- **Filtering**: Filter by category, difficulty, pricing, and tags
- **Pricing Labels**: Free, freemium, paid, open-source indicators
- **Difficulty Levels**: Beginner, intermediate, advanced
- **Voting & Comments**: Community engagement on resources
- **Internal Articles**: Long-form content hosted on the platform

### Vibecoders

User profiles and community directory.

- **Profile Pages**: Personal pages with bio, links, and project portfolio
- **Twitter Integration**: Import avatars from Twitter/X handles
- **Avatar Storage**: Persistent avatar storage via Supabase
- **Project Showcase**: All approved projects displayed on profile
- **Grants Created**: Track grants a user has sponsored
- **Social Links**: Twitter, GitHub, and personal website links
- **Top Vibecoders**: Leaderboard sidebar on homepage

### Search

Powerful site-wide search functionality.

- **Universal Search**: Search across projects, users, grants, resources, and AI tools
- **Real-time Results**: Debounced search with instant feedback
- **Parallel Queries**: All search categories queried simultaneously
- **Rich Previews**: Thumbnails, descriptions, and type badges
- **Keyboard Navigation**: Open with Cmd/Ctrl+K, close with Escape

### Admin Dashboard

Content moderation and site management.

- **Project Moderation**: Approve, reject, or feature submitted projects
- **Grant Management**: Create, edit, and manage grants
- **Resource Management**: Add and edit learning resources
- **User Management**: View and manage user accounts
- **Submission Review**: Review grant submissions

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Supabase Auth with Twitter OAuth |
| **Storage** | Supabase Storage |
| **Styling** | Tailwind CSS |
| **UI Components** | Custom RetroUI design system |
| **Icons** | Lucide React |
| **Markdown** | React Markdown with remark-gfm |
| **Avatar Fallback** | Unavatar.io, DiceBear, UI Avatars |

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0 or higher
- **npm** or **yarn** or **pnpm**
- **Git**
- A **Supabase** account (free tier works)
- A **Twitter Developer** account (optional, for avatar fetching)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vamp.git
cd vamp
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to **Settings** → **API** to get your keys

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Twitter API (Optional - for avatar fetching)
TWITTER_BEARER_TOKEN=your-twitter-bearer-token
```

#### Where to find these values:

| Variable | Location |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role (keep secret!) |
| `TWITTER_BEARER_TOKEN` | Twitter Developer Portal → Your App → Keys and Tokens |

---

## Database Setup

### 1. Create Database Tables

**Option A – One-click deploy (recommended)**  
Run the full schema in one go (correct table order, RLS, triggers, storage):

- Open **Supabase Dashboard** → **SQL Editor**
- Paste and run the contents of [`supabase/full_schema_deploy.sql`](supabase/full_schema_deploy.sql)

**Option B – Step by step**  
Create tables manually in dependency order (grants before projects). Run in **Supabase Dashboard** → **SQL Editor**:

```sql
-- Users table (email nullable for Twitter-only auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  twitter_handle TEXT,
  github_handle TEXT,
  website TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grants table (must exist before projects – projects reference grants)
CREATE TABLE grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  short_description TEXT,
  description TEXT NOT NULL,
  prize_amount TEXT NOT NULL,
  requirements TEXT NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  sponsor_twitter_url TEXT,
  tweet_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'completed')),
  created_by UUID REFERENCES users(id),
  comment_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
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
  grant_id UUID REFERENCES grants(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resources table (Learn section; user_id and status for community submissions)
CREATE TABLE resources (
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
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'featured')),
  comment_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_status ON resources(status);

-- Upvotes table
CREATE TABLE upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  project_id UUID REFERENCES projects(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Downvotes table
CREATE TABLE downvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  project_id UUID REFERENCES projects(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- Grant submissions table
CREATE TABLE grant_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grant_id UUID REFERENCES grants(id) NOT NULL,
  project_id UUID REFERENCES projects(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  pitch TEXT NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'winner', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  grant_id UUID REFERENCES grants(id),
  project_id UUID REFERENCES projects(id),
  resource_id UUID REFERENCES resources(id),
  parent_id UUID REFERENCES comments(id),
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource votes table
CREATE TABLE resource_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  resource_id UUID REFERENCES resources(id) NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('comment_reply', 'project_comment', 'grant_comment', 'grant_submission', 'project_approved', 'grant_winner')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 2. Set Up Row Level Security (RLS)

Enable RLS on all tables and create appropriate policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE downvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE grant_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Public read access for most tables
CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
CREATE POLICY "Public read access" ON projects FOR SELECT USING (status IN ('approved', 'featured') OR auth.uid() = user_id);
CREATE POLICY "Public read access" ON grants FOR SELECT USING (status IN ('active', 'closed', 'completed') OR auth.uid() = created_by);
CREATE POLICY "Public read access" ON resources FOR SELECT USING (status IN ('approved', 'featured') OR auth.uid() = user_id);
CREATE POLICY "Public read access" ON comments FOR SELECT USING (true);
CREATE POLICY "Public read access" ON upvotes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON downvotes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON grant_submissions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON resource_votes FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);

-- Grants
CREATE POLICY "Users can create grants" ON grants FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own grants" ON grants FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Users can delete own grants" ON grants FOR DELETE USING (auth.uid() = created_by);

-- Resources
CREATE POLICY "Users can insert resources" ON resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resources" ON resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON resources FOR DELETE USING (auth.uid() = user_id);

-- Upvotes / downvotes
CREATE POLICY "Users can insert upvotes" ON upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own upvotes" ON upvotes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert downvotes" ON downvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own downvotes" ON downvotes FOR DELETE USING (auth.uid() = user_id);

-- Grant submissions
CREATE POLICY "Users can insert grant_submissions" ON grant_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own grant_submissions" ON grant_submissions FOR UPDATE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Resource votes
CREATE POLICY "Users can insert resource_votes" ON resource_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resource_votes" ON resource_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resource_votes" ON resource_votes FOR DELETE USING (auth.uid() = user_id);

-- Notifications: users can only view/update/delete their own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
```

### 3. Set Up Avatar Storage

Run the avatar storage migration:

```sql
-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public Avatar Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatars" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND (auth.role() = 'service_role' OR auth.uid()::text = (string_to_array(name, '/'))[1])
);
```

### 3b. Set Up Images Storage (project thumbnails, article images)

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Image Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'images' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (
  bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (
  bucket_id = 'images' AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### 4. Set Up Authentication

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **Twitter** provider
3. Add your Twitter OAuth credentials
4. Set the callback URL to: `https://your-domain.com/auth/callback`

---

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

---

## Project Structure

```
vamp/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public-facing pages
│   │   ├── grants/               # Grants listing and details
│   │   │   ├── page.tsx          # /grants - All grants
│   │   │   └── [id]/page.tsx     # /grants/[id] - Grant details
│   │   ├── learn/                # Learning resources
│   │   │   ├── page.tsx          # /learn - Resources listing
│   │   │   └── [slug]/page.tsx   # /learn/[slug] - Article page
│   │   ├── projects/             # Projects showcase
│   │   │   ├── page.tsx          # /projects - All projects
│   │   │   └── [id]/page.tsx     # /projects/[id] - Project details
│   │   ├── u/[username]/         # User profiles
│   │   ├── vibecoders/           # Community directory
│   │   └── page.tsx              # Homepage
│   ├── admin/                    # Admin dashboard (protected)
│   │   ├── grants/               # Grant management
│   │   ├── projects/             # Project moderation
│   │   ├── resources/            # Resource management
│   │   ├── submissions/          # Submission review
│   │   └── users/                # User management
│   ├── api/                      # API routes
│   │   ├── twitter-avatar/       # Avatar fetching API
│   │   ├── refresh-avatar/       # Avatar refresh endpoint
│   │   └── setup-storage/        # Storage initialization
│   ├── auth/                     # Authentication
│   │   └── callback/             # OAuth callback handler
│   ├── dashboard/                # User dashboard (protected)
│   │   ├── projects/             # User's projects
│   │   ├── settings/             # Profile settings
│   │   └── submissions/          # User's grant submissions
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── cards/                    # Card components
│   │   ├── GrantRow.tsx          # Grant list item
│   │   ├── ProjectCard.tsx       # Project card
│   │   ├── ProjectRow.tsx        # Project list item
│   │   ├── ResourceCard.tsx      # Resource card
│   │   └── UserCard.tsx          # User card
│   ├── grants/                   # Grant-specific components
│   │   ├── GrantComments.tsx     # Grant comments section
│   │   ├── GrantImageSlideshow.tsx
│   │   └── GrantsTabs.tsx        # Active/Past grants tabs
│   ├── layout/                   # Layout components
│   │   ├── Container.tsx         # Page container
│   │   ├── Header.tsx            # Navigation header
│   │   └── Footer.tsx            # Page footer
│   ├── resources/                # Resource components
│   │   └── ResourceComments.tsx  # Resource comments
│   ├── retroui/                  # RetroUI design system
│   │   ├── Avatar.tsx            # Avatar component
│   │   ├── Badge.tsx             # Badge/tag component
│   │   ├── Button.tsx            # Button component
│   │   ├── Card.tsx              # Card component
│   │   ├── Input.tsx             # Input component
│   │   └── Text.tsx              # Typography component
│   └── ui/                       # Shared UI components
│       ├── Markdown.tsx          # Markdown renderer
│       ├── SearchModal.tsx       # Global search modal
│       ├── TwitterAvatar.tsx     # Twitter avatar with fallbacks
│       └── ResourceVoteButton.tsx # Voting component
│
├── lib/                          # Utilities and configuration
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   ├── utils/                    # Utility functions
│   │   ├── avatar-storage.ts     # Avatar upload/fetch
│   │   ├── twitter.ts            # Twitter helpers
│   │   └── index.ts              # General utilities
│   └── constants.ts              # App constants
│
├── types/                        # TypeScript types
│   └── index.ts                  # Type definitions
│
├── scripts/                      # Utility scripts
│   ├── upload-avatar.mjs         # Manual avatar upload
│   └── add-grants-column.mjs     # Database migrations
│
├── supabase/                     # Supabase configuration
│   └── migrations/               # SQL migrations
│
├── public/                       # Static assets
├── .env.local                    # Environment variables (create this)
├── .env.local.example            # Example environment file
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## Key Components

### TwitterAvatar

Smart avatar component with multiple fallback strategies:

1. Uses stored Supabase URL if available
2. Falls back to Unavatar.io for Twitter avatars
3. Falls back to DiceBear for generated avatars
4. Final fallback to UI Avatars

```tsx
<TwitterAvatar
  src={user.avatar_url}
  alt={user.display_name}
  twitterHandle={user.twitter_handle}
  userId={user.id}
/>
```

### SearchModal

Global search with parallel queries across all content types:

- Projects (title, tagline, description)
- Users (display name, username, twitter handle)
- Grants (title, description)
- Resources (title, description)
- AI Tools (title, description)

### RetroUI Components

Custom design system with a retro aesthetic:

- Bold borders and shadows
- High contrast colors
- Playful typography
- Consistent spacing

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/twitter-avatar/[handle]` | GET | Fetch avatar for Twitter handle |
| `/api/refresh-avatar` | POST | Force refresh user's avatar |
| `/api/setup-storage` | POST | Initialize storage bucket |

---

## Database Schema

### Entity Relationship

```
users
  ├── projects (one-to-many)
  ├── grants (one-to-many, as creator)
  ├── upvotes (one-to-many)
  ├── downvotes (one-to-many)
  ├── comments (one-to-many)
  ├── grant_submissions (one-to-many)
  ├── resource_votes (one-to-many)
  └── notifications (one-to-many)

projects
  ├── user (many-to-one)
  ├── grant (many-to-one, optional)
  ├── upvotes (one-to-many)
  ├── downvotes (one-to-many)
  └── comments (one-to-many)

grants
  ├── creator (many-to-one)
  ├── submissions (one-to-many)
  └── comments (one-to-many)

resources
  ├── comments (one-to-many)
  └── votes (one-to-many)
```

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TWITTER_BEARER_TOKEN` (optional)

### Supabase Production Setup

1. Use a separate Supabase project for production
2. Run all migrations on the production database
3. Set up proper RLS policies
4. Configure OAuth redirect URLs for production domain

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a branch** for your feature: `git checkout -b feature/amazing-feature`
4. **Make your changes** and test thoroughly
5. **Commit** with clear messages: `git commit -m "Add amazing feature"`
6. **Push** to your fork: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a clear description

### Code Style

- Use TypeScript for all new code
- Follow existing component patterns
- Use Tailwind CSS for styling
- Keep components small and focused

---

## Troubleshooting

### Common Issues

**Avatar not loading:**
- Check if `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify storage bucket policies are configured
- Check browser console for errors

**Auth not working:**
- Verify Twitter OAuth credentials
- Check callback URL configuration
- Ensure Supabase Auth is enabled

**Database errors:**
- Run all migrations in order
- Check RLS policies
- Verify foreign key relationships

---

## License

MIT License - feel free to use this project for your own purposes.

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Built with vibes by vibecoders, for vibecoders.**

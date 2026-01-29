export type UserRole = 'user' | 'admin'

export type ProjectStatus = 'pending' | 'approved' | 'rejected' | 'featured'

export type GrantStatus = 'draft' | 'active' | 'closed' | 'completed'

export type ResourceCategory = 'tutorial' | 'tool' | 'expert' | 'article' | 'video'

export type AIToolType = 'code-assistant' | 'image-generator' | 'text-generator' | 'design-tool' | 'video-generator' | 'audio-generator' | 'data-analysis' | 'other'

export type ResourcePricing = 'free' | 'freemium' | 'paid' | 'open-source'

export type ResourceDifficulty = 'beginner' | 'intermediate' | 'advanced'

export type ResourceStatus = 'pending' | 'approved' | 'rejected' | 'featured'

export type SubmissionStatus = 'submitted' | 'under_review' | 'winner' | 'rejected'

export interface User {
  id: string
  email: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  twitter_handle: string | null
  github_handle: string | null
  website: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  tagline: string
  description: string
  demo_url: string
  github_url: string
  thumbnail_url: string | null
  tags: string[]
  status: ProjectStatus
  upvote_count: number
  downvote_count?: number
  comment_count?: number
  grant_id: string | null
  created_at: string
  updated_at: string
  // Joined fields
  user?: User
  has_upvoted?: boolean
  has_downvoted?: boolean
}

export interface Grant {
  id: string
  title: string
  short_description: string | null
  description: string
  prize_amount: string
  requirements: string
  deadline: string
  sponsor_name: string
  sponsor_logo_url: string | null
  sponsor_twitter_url: string | null
  tweet_url: string | null
  image_urls?: string[]
  comment_count?: number
  status: GrantStatus
  created_by: string | null
  created_at: string
  updated_at: string
  // Computed fields
  submission_count?: number
  // Joined fields
  creator?: User
}

export interface Upvote {
  id: string
  user_id: string
  project_id: string
  created_at: string
}

export interface Comment {
  id: string
  grant_id: string | null
  project_id: string | null
  resource_id: string | null
  parent_id: string | null
  user_id: string
  body: string
  created_at: string
  // Joined
  user?: User
  replies?: Comment[]
}

export interface Resource {
  id: string
  user_id: string | null
  title: string
  description: string
  url: string
  category: ResourceCategory
  thumbnail_url: string | null
  is_featured: boolean
  status: ResourceStatus
  tags: string[]
  ai_tool_type: AIToolType | null
  pricing: ResourcePricing | null
  difficulty: ResourceDifficulty | null
  created_at: string
  updated_at: string
  // Joined fields
  user?: User
}

export interface GrantSubmission {
  id: string
  grant_id: string
  project_id: string
  user_id: string
  pitch: string
  status: SubmissionStatus
  created_at: string
  updated_at: string
  // Joined fields
  project?: Project
  user?: User
  grant?: Grant
}

// Form types
export interface ProjectFormData {
  title: string
  tagline: string
  description: string
  demo_url: string
  github_url: string
  thumbnail_url?: string
  tags: string[]
}

export interface GrantFormData {
  title: string
  short_description?: string
  description: string
  prize_amount: string
  requirements: string
  deadline: string
  sponsor_name: string
  sponsor_logo_url?: string
  sponsor_twitter_url?: string
  tweet_url?: string
  status: GrantStatus
}

export interface ResourceFormData {
  title: string
  description: string
  url: string
  category: ResourceCategory
  thumbnail_url?: string
  is_featured?: boolean
  status?: ResourceStatus
  tags: string[]
  ai_tool_type?: AIToolType | null
  pricing?: ResourcePricing | null
  difficulty?: ResourceDifficulty | null
}

export interface ProfileFormData {
  username: string
  display_name: string
  bio: string
  twitter_handle: string
  github_handle: string
  website: string
}

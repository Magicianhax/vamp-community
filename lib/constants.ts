export const APP_NAME = 'Vamp'
export const APP_DESCRIPTION = 'Discover vibecoded projects, submit your work for grants, learn from curated resources, and get discovered as a vibecoder.'

export const NAV_LINKS = [
  { href: '/projects', label: 'Projects' },
  { href: '/grants', label: 'Grants' },
  { 
    href: '/learn', 
    label: 'Learn',
    submenu: [
      { href: '/learn', label: 'All Resources' },
      { href: '/learn?section=guides', label: 'Guides' },
      { href: '/learn?section=tools', label: 'AI Tools' },
      { href: '/learn?section=tutorials', label: 'Tutorials' },
      { href: '/learn?section=videos', label: 'Videos' },
      { href: '/learn?section=experts', label: 'Experts' },
    ]
  },
  { href: '/vibecoders', label: 'Vibecoders' },
  { href: '/vamp', label: '$VAMP' },
  { href: '/faq', label: 'FAQ' },
] as const

export const DASHBOARD_NAV_LINKS = [
  { href: '/dashboard', label: 'Overview', icon: 'LayoutDashboard' },
  { href: '/dashboard/projects', label: 'My Projects', icon: 'Folder' },
  { href: '/dashboard/projects/new', label: 'Submit Project', icon: 'Plus' },
  { href: '/dashboard/resources', label: 'My Resources', icon: 'BookOpen' },
  { href: '/dashboard/resources/new', label: 'Submit Resource', icon: 'PenLine' },
  { href: '/dashboard/grants', label: 'My Grants', icon: 'Trophy' },
  { href: '/dashboard/grants/new', label: 'Sponsor Grant', icon: 'Gift' },
  { href: '/dashboard/submissions', label: 'Submissions', icon: 'Send' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
] as const

export const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/projects', label: 'Projects', icon: 'Folder' },
  { href: '/admin/users', label: 'Users', icon: 'Users' },
  { href: '/admin/grants', label: 'Grants', icon: 'Trophy' },
  { href: '/admin/resources', label: 'Resources', icon: 'BookOpen' },
  { href: '/admin/submissions', label: 'Submissions', icon: 'FileCheck' },
] as const

export const PROJECT_STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  featured: 'Featured',
} as const

export const PROJECT_STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  featured: 'bg-accent/10 text-accent border-accent/20',
} as const

export const GRANT_STATUS_LABELS = {
  draft: 'Draft',
  active: 'Active',
  closed: 'Closed',
  completed: 'Completed',
} as const

export const GRANT_STATUS_COLORS = {
  draft: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  active: 'bg-green-500/10 text-green-500 border-green-500/20',
  closed: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  completed: 'bg-accent/10 text-accent border-accent/20',
} as const

export const RESOURCE_CATEGORIES = [
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'tool', label: 'Tool' },
  { value: 'expert', label: 'Expert' },
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
] as const

export const AI_TOOL_TYPES = [
  { value: 'code-assistant', label: 'Code Assistant' },
  { value: 'image-generator', label: 'Image Generator' },
  { value: 'text-generator', label: 'Text Generator' },
  { value: 'design-tool', label: 'Design Tool' },
  { value: 'video-generator', label: 'Video Generator' },
  { value: 'audio-generator', label: 'Audio Generator' },
  { value: 'data-analysis', label: 'Data Analysis' },
  { value: 'other', label: 'Other' },
] as const

export const RESOURCE_PRICING = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
  { value: 'open-source', label: 'Open Source' },
] as const

export const RESOURCE_DIFFICULTY = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const

export const RESOURCE_STATUS_LABELS = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  featured: 'Featured',
} as const

export const RESOURCE_STATUS_COLORS = {
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  featured: 'bg-accent/10 text-accent border-accent/20',
} as const

export const SUBMISSION_STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  winner: 'Winner',
  rejected: 'Rejected',
} as const

export const SUBMISSION_STATUS_COLORS = {
  submitted: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  under_review: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  winner: 'bg-accent/10 text-accent border-accent/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
} as const

export const POPULAR_TAGS = [
  'ai',
  'web',
  'mobile',
  'saas',
  'tool',
  'game',
  'defi',
  'social',
  'productivity',
  'education',
] as const

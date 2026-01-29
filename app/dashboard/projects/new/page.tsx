'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button, Input, Badge } from '@/components/ui'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })
import { createClient } from '@/lib/supabase/client'
import { POPULAR_TAGS } from '@/lib/constants'

export default function NewProjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const grantId = searchParams.get('grant')

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    demo_url: '',
    github_url: '',
    thumbnail_url: '',
  })
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim()
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 5) {
      setTags((prev) => [...prev, normalizedTag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.tagline.trim()) {
      setError('Tagline is required')
      return
    }

    if (!formData.description.trim()) {
      setError('Description is required')
      return
    }

    if (!formData.demo_url.trim()) {
      setError('Demo URL is required')
      return
    }

    if (!formData.github_url.trim()) {
      setError('GitHub URL is required')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      
      // First, try to get the session to ensure auth state is initialized
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        setError(`Authentication error: ${sessionError.message}`)
        setIsLoading(false)
        return
      }

      if (!session || !session.user) {
        console.error('No session or user found')
        router.push('/login')
        return
      }

      const user = session.user
      console.log('Project submission: User authenticated:', user.id)

      // Ensure user exists in users table (in case trigger didn't fire)
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        console.log('User not found in users table, creating...')
        // Extract username from email or use a default
        const username = user.email?.split('@')[0] || 
                        user.user_metadata?.user_name || 
                        user.user_metadata?.preferred_username ||
                        `user_${user.id.slice(0, 8)}`
        
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            username: username.toLowerCase(),
            display_name: user.user_metadata?.name || user.user_metadata?.full_name || username,
            avatar_url: user.user_metadata?.avatar_url || null,
            twitter_handle: user.user_metadata?.user_name || null,
          })

        if (createUserError) {
          console.error('Error creating user:', createUserError)
          setError(`Failed to create user profile: ${createUserError.message}`)
          setIsLoading(false)
          return
        }
      }

      console.log('Submitting project with user:', user.id)

      const projectData = {
        user_id: user.id,
        title: formData.title.trim(),
        tagline: formData.tagline.trim(),
        description: formData.description.trim(),
        demo_url: formData.demo_url.trim(),
        github_url: formData.github_url.trim(),
        thumbnail_url: formData.thumbnail_url.trim() || null,
        tags,
        grant_id: grantId || null,
      }

      console.log('Project data:', projectData)

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        setError(insertError.message || 'Failed to submit project. Please check your connection and try again.')
      } else if (data) {
        console.log('Project created successfully:', data)
        router.push('/dashboard/projects')
      } else {
        console.error('No data returned from insert')
        setError('Project submitted but no confirmation received. Please check your projects list.')
        router.push('/dashboard/projects')
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/dashboard/projects"
        className="inline-flex items-center gap-2 text-text-secondary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Submit New Project</h1>
        <p className="text-text-secondary mt-1">
          Share your vibecoded project with the community
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 text-sm text-error">
            {error}
          </div>
        )}

        <Input
          label="Project Title"
          name="title"
          placeholder="My Awesome Project"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Input
          label="Tagline"
          name="tagline"
          placeholder="A short description of your project"
          value={formData.tagline}
          onChange={handleChange}
          hint="One sentence that describes what your project does"
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">
            Description
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={formData.description}
              onChange={(val) => setFormData((prev) => ({ ...prev, description: val || '' }))}
              preview="edit"
              height={250}
            />
          </div>
          <p className="text-sm text-text-muted">Supports Markdown formatting</p>
        </div>

        <Input
          label="Demo URL"
          name="demo_url"
          type="url"
          placeholder="https://myproject.com"
          value={formData.demo_url}
          onChange={handleChange}
          hint="Link to your live demo"
          required
        />

        <Input
          label="GitHub URL"
          name="github_url"
          type="url"
          placeholder="https://github.com/username/project"
          value={formData.github_url}
          onChange={handleChange}
          hint="Link to your public repository"
          required
        />

        <Input
          label="Thumbnail URL (Optional)"
          name="thumbnail_url"
          type="url"
          placeholder="https://example.com/thumbnail.png"
          value={formData.thumbnail_url}
          onChange={handleChange}
          hint="A square image for your project card"
        />

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Tags (up to 5)
          </label>

          {/* Selected Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} className="pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 p-0.5 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Tag Input */}
          {tags.length < 5 && (
            <Input
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          )}

          {/* Popular Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {POPULAR_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                disabled={tags.length >= 5}
                className="px-2 py-1 text-xs bg-surface-hover text-text-secondary disabled:opacity-50"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isLoading}>
            Submit Project
          </Button>
          <Link href="/dashboard/projects">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

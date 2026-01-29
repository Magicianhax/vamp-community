'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X, Trash2 } from 'lucide-react'
import { Button, Input, Textarea, Badge, ConfirmModal, ImageUpload } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { POPULAR_TAGS } from '@/lib/constants'

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string

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
  const [isFetching, setIsFetching] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/login')
        return
      }

      const user = session.user

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (!data) {
        router.push('/dashboard/projects')
        return
      }

      setFormData({
        title: data.title,
        tagline: data.tagline,
        description: data.description,
        demo_url: data.demo_url,
        github_url: data.github_url,
        thumbnail_url: data.thumbnail_url || '',
      })
      setTags(data.tags || [])
      setIsFetching(false)
    }

    fetchProject()
  }, [projectId, router])

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
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from('projects')
        .update({
          title: formData.title.trim(),
          tagline: formData.tagline.trim(),
          description: formData.description.trim(),
          demo_url: formData.demo_url.trim(),
          github_url: formData.github_url.trim(),
          thumbnail_url: formData.thumbnail_url.trim() || null,
          tags,
        })
        .eq('id', projectId)

      if (updateError) {
        setError(updateError.message)
      } else {
        router.push('/dashboard/projects')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const supabase = createClient()

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (deleteError) {
        setError(deleteError.message)
      } else {
        router.push('/dashboard/projects')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (isFetching) {
    return (
      <div className="max-w-2xl animate-pulse">
        <div className="h-8 w-32 bg-surface-hover rounded mb-6" />
        <div className="h-10 w-64 bg-surface-hover rounded mb-2" />
        <div className="h-4 w-48 bg-surface-hover rounded mb-8" />
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-hover rounded" />
          ))}
        </div>
      </div>
    )
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

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Edit Project</h1>
          <p className="text-text-secondary mt-1">Update your project details</p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
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
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Input
          label="Tagline"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          required
        />

        <Input
          label="Demo URL"
          name="demo_url"
          type="url"
          value={formData.demo_url}
          onChange={handleChange}
          required
        />

        <Input
          label="GitHub URL"
          name="github_url"
          type="url"
          value={formData.github_url}
          onChange={handleChange}
          required
        />

        <ImageUpload
          label="Project Logo (Optional)"
          value={formData.thumbnail_url}
          onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail_url: url || '' }))}
          size="square"
          folder="projects"
          hint="A square image for your project card. Max 5MB."
        />

        {/* Tags */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text-primary">
            Tags (up to 5)
          </label>

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

          {tags.length < 5 && (
            <Input
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          )}

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
            Save Changes
          </Button>
          <Link href="/dashboard/projects">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}

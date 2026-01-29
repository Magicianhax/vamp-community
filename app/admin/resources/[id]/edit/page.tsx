'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button, Input, Textarea, Select, ImageUpload } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { RESOURCE_CATEGORIES, AI_TOOL_TYPES, RESOURCE_PRICING, RESOURCE_DIFFICULTY } from '@/lib/constants'
import type { ResourceCategory, AIToolType, ResourcePricing, ResourceDifficulty } from '@/types'

export default function EditResourcePage() {
  const router = useRouter()
  const params = useParams()
  const resourceId = params.id as string

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'tutorial' as ResourceCategory,
    thumbnail_url: '',
    is_featured: false,
    tags: '' as string,
    ai_tool_type: '' as AIToolType | '',
    pricing: '' as ResourcePricing | '',
    difficulty: '' as ResourceDifficulty | '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const fetchResource = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .single()

      if (!data) {
        router.push('/admin/resources')
        return
      }

      setFormData({
        title: data.title,
        description: data.description,
        url: data.url,
        category: data.category,
        thumbnail_url: data.thumbnail_url || '',
        is_featured: data.is_featured,
        tags: (data.tags || []).join(', '),
        ai_tool_type: data.ai_tool_type || '',
        pricing: data.pricing || '',
        difficulty: data.difficulty || '',
      })
      setIsFetching(false)
    }

    fetchResource()
  }, [resourceId, router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value
    setFormData((prev) => ({ ...prev, [e.target.name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()

      // Parse tags from comma-separated string
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const { error: updateError } = await supabase
        .from('resources')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          url: formData.url.trim(),
          category: formData.category,
          thumbnail_url: formData.thumbnail_url.trim() || null,
          is_featured: formData.is_featured,
          tags: tags.length > 0 ? tags : [],
          ai_tool_type: formData.ai_tool_type || null,
          pricing: formData.pricing || null,
          difficulty: formData.difficulty || null,
        })
        .eq('id', resourceId)

      if (updateError) {
        setError(updateError.message)
      } else {
        router.push('/admin/resources')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="max-w-2xl animate-pulse">
        <div className="h-8 w-32 bg-surface-hover rounded mb-6" />
        <div className="h-10 w-64 bg-surface-hover rounded mb-8" />
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
        href="/admin/resources"
        className="inline-flex items-center gap-2 text-text-secondary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Resources
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Edit Resource</h1>
        <p className="text-text-secondary mt-1">Update resource details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 text-sm text-error">
            {error}
          </div>
        )}

        <Input
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          required
        />

        <Input
          label="URL"
          name="url"
          type="url"
          value={formData.url}
          onChange={handleChange}
          required
        />

        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={RESOURCE_CATEGORIES.map((cat) => ({
            value: cat.value,
            label: cat.label,
          }))}
        />

        <ImageUpload
          label="Featured Image (Optional)"
          value={formData.thumbnail_url}
          onChange={(url) => setFormData((prev) => ({ ...prev, thumbnail_url: url || '' }))}
          size="featured"
          folder="resources"
          hint="Recommended: 1200x630 for social sharing. Max 5MB."
        />

        <Input
          label="Tags (comma-separated)"
          name="tags"
          placeholder="ai, coding, cursor, chatgpt"
          value={formData.tags}
          onChange={handleChange}
        />

        <Select
          label="AI Tool Type (Optional)"
          name="ai_tool_type"
          value={formData.ai_tool_type}
          onChange={handleChange}
          options={[
            { value: '', label: 'Not an AI tool' },
            ...AI_TOOL_TYPES.map((type) => ({
              value: type.value,
              label: type.label,
            })),
          ]}
        />

        <Select
          label="Pricing (Optional)"
          name="pricing"
          value={formData.pricing}
          onChange={handleChange}
          options={[
            { value: '', label: 'Not specified' },
            ...RESOURCE_PRICING.map((pricing) => ({
              value: pricing.value,
              label: pricing.label,
            })),
          ]}
        />

        <Select
          label="Difficulty Level (Optional)"
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
          options={[
            { value: '', label: 'Not specified' },
            ...RESOURCE_DIFFICULTY.map((diff) => ({
              value: diff.value,
              label: diff.label,
            })),
          ]}
        />

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_featured"
            checked={formData.is_featured}
            onChange={handleChange}
            className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-primary"
          />
          <span className="text-sm text-text-primary">Feature this resource</span>
        </label>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
          <Link href="/admin/resources">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button, Input, Textarea, Select, Badge, ImageUpload } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { GRANT_STATUS_LABELS } from '@/lib/constants'
import type { GrantStatus } from '@/types'

export default function EditGrantPage() {
  const router = useRouter()
  const params = useParams()
  const grantId = params.id as string

  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    prize_amount: '',
    requirements: '',
    deadline: '',
    sponsor_name: '',
    sponsor_logo_url: '',
    sponsor_twitter_url: '',
    tweet_url: '',
    image_urls_text: '',
    status: 'draft' as GrantStatus,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const fetchGrant = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data } = await supabase
        .from('grants')
        .select('*')
        .eq('id', grantId)
        .single()

      if (!data) {
        router.push('/dashboard/grants')
        return
      }

      // Verify ownership
      if (data.created_by !== user.id) {
        router.push('/dashboard/grants')
        return
      }

      const imageUrls = data.image_urls ?? []
      setFormData({
        title: data.title,
        short_description: data.short_description || '',
        description: data.description,
        prize_amount: data.prize_amount,
        requirements: data.requirements,
        deadline: new Date(data.deadline).toISOString().slice(0, 16),
        sponsor_name: data.sponsor_name,
        sponsor_logo_url: data.sponsor_logo_url || '',
        sponsor_twitter_url: data.sponsor_twitter_url || '',
        tweet_url: data.tweet_url || '',
        image_urls_text: Array.isArray(imageUrls) ? imageUrls.join('\n') : '',
        status: data.status,
      })
      setIsFetching(false)
    }

    fetchGrant()
  }, [grantId, router])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!userId) {
      setError('Please sign in to edit this grant')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const imageUrls = formData.image_urls_text
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean)

      const { error: updateError } = await supabase
        .from('grants')
        .update({
          title: formData.title.trim(),
          short_description: formData.short_description.trim() || null,
          description: formData.description.trim(),
          prize_amount: formData.prize_amount.trim(),
          requirements: formData.requirements.trim(),
          deadline: new Date(formData.deadline).toISOString(),
          sponsor_name: formData.sponsor_name.trim(),
          sponsor_logo_url: formData.sponsor_logo_url.trim() || null,
          sponsor_twitter_url: formData.sponsor_twitter_url.trim() || null,
          tweet_url: formData.tweet_url.trim() || null,
          image_urls: imageUrls,
          status: formData.status,
        })
        .eq('id', grantId)

      if (updateError) {
        setError(updateError.message)
      } else {
        router.push('/dashboard/grants')
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
        <div className="h-8 w-32 bg-muted rounded mb-6" />
        <div className="h-10 w-64 bg-muted rounded mb-8" />
        <div className="space-y-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/dashboard/grants"
        className="inline-flex items-center gap-2 text-text-secondary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Grants
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-text-primary">Edit Grant</h1>
          <Badge
            size="sm"
            variant={formData.status === 'active' ? 'accent' : 'default'}
          >
            {GRANT_STATUS_LABELS[formData.status]}
          </Badge>
        </div>
        <p className="text-text-secondary">Update your grant details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 text-sm text-error">
            {error}
          </div>
        )}

        <Input
          label="Grant Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <Input
          label="Short Description (shown in previews)"
          name="short_description"
          value={formData.short_description}
          onChange={handleChange}
        />

        <Textarea
          label="Full Description (Markdown supported)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={6}
          required
        />

        <Input
          label="Prize Amount"
          name="prize_amount"
          value={formData.prize_amount}
          onChange={handleChange}
          required
        />

        <Textarea
          label="Requirements (Markdown supported)"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          rows={6}
          required
        />

        <Input
          label="Deadline"
          name="deadline"
          type="datetime-local"
          value={formData.deadline}
          onChange={handleChange}
          required
        />

        <div className="border-t-2 border-black pt-6 mt-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Sponsor Information</h2>

          <div className="space-y-6">
            <Input
              label="Sponsor Name"
              name="sponsor_name"
              value={formData.sponsor_name}
              onChange={handleChange}
              required
            />

            <ImageUpload
              label="Sponsor Logo (Optional)"
              value={formData.sponsor_logo_url}
              onChange={(url) => setFormData((prev) => ({ ...prev, sponsor_logo_url: url || '' }))}
              size="square"
              folder="grants"
              hint="Square image works best. Max 5MB."
            />

            <Input
              label="Sponsor Twitter/X URL (Optional)"
              name="sponsor_twitter_url"
              type="url"
              placeholder="https://x.com/yourusername"
              value={formData.sponsor_twitter_url}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="border-t-2 border-black pt-6 mt-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Additional Options</h2>

          <div className="space-y-6">
            <Input
              label="Announcement Tweet URL (Optional)"
              name="tweet_url"
              type="url"
              placeholder="https://x.com/yourusername/status/123456789"
              value={formData.tweet_url}
              onChange={handleChange}
            />

            <div>
              <label htmlFor="image_urls_text" className="block text-sm font-medium text-text-primary mb-1">
                Banner Images (one URL per line, optional)
              </label>
              <textarea
                id="image_urls_text"
                name="image_urls_text"
                value={formData.image_urls_text}
                onChange={(e) => setFormData((prev) => ({ ...prev, image_urls_text: e.target.value }))}
                rows={3}
                placeholder={'https://example.com/banner1.jpg\nhttps://example.com/banner2.jpg'}
                className="w-full px-4 py-2.5 border border-border rounded-lg text-text-primary placeholder-text-muted bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              <p className="text-xs text-text-muted mt-1">
                These images will be shown as a slideshow at the top of your grant page
              </p>
            </div>

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'draft', label: 'Draft (not visible to others)' },
                { value: 'active', label: 'Active (accepting submissions)' },
                { value: 'closed', label: 'Closed (no new submissions)' },
                { value: 'completed', label: 'Completed (winner selected)' },
              ]}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
          <Link href="/dashboard/grants">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

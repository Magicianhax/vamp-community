'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import dynamic from 'next/dynamic'
import { Button, Input, Select } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import type { GrantStatus } from '@/types'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export default function EditGrantPage() {
  const router = useRouter()
  const params = useParams()
  const grantId = params.id as string

  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    prize_amount: '',
    requirements: '',
    deadline: '',
    sponsor_name: '',
    sponsor_logo_url: '',
    image_urls_text: '',
    status: 'draft' as GrantStatus,
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    const fetchGrant = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('grants')
        .select('*')
        .eq('id', grantId)
        .single()

      if (!data) {
        router.push('/admin/grants')
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
          image_urls: imageUrls,
          status: formData.status,
        })
        .eq('id', grantId)

      if (updateError) {
        setError(updateError.message)
      } else {
        router.push('/admin/grants')
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
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-12 bg-surface-hover rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/grants"
        className="inline-flex items-center gap-2 text-text-secondary mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Grants
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Edit Grant</h1>
        <p className="text-text-secondary mt-1">Update grant details</p>
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
          label="Short Description (shown as preview)"
          name="short_description"
          placeholder="vibecode the Vamp Community web app"
          value={formData.short_description}
          onChange={handleChange}
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">
            Description <span className="text-error">*</span>
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={formData.description}
              onChange={(val) => setFormData((prev) => ({ ...prev, description: val || '' }))}
              preview="edit"
              height={200}
            />
          </div>
          <p className="text-sm text-text-muted">Describe what this grant is about (supports Markdown)</p>
        </div>

        <Input
          label="Prize Amount"
          name="prize_amount"
          value={formData.prize_amount}
          onChange={handleChange}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-primary">
            Requirements <span className="text-error">*</span>
          </label>
          <div data-color-mode="light">
            <MDEditor
              value={formData.requirements}
              onChange={(val) => setFormData((prev) => ({ ...prev, requirements: val || '' }))}
              preview="edit"
              height={200}
            />
          </div>
          <p className="text-sm text-text-muted">List the requirements for submissions (supports Markdown)</p>
        </div>

        <Input
          label="Deadline"
          name="deadline"
          type="datetime-local"
          value={formData.deadline}
          onChange={handleChange}
          required
        />

        <Input
          label="Sponsor Name"
          name="sponsor_name"
          value={formData.sponsor_name}
          onChange={handleChange}
          required
        />

        <Input
          label="Sponsor Logo URL (Optional)"
          name="sponsor_logo_url"
          type="url"
          value={formData.sponsor_logo_url}
          onChange={handleChange}
        />

        <div>
          <label htmlFor="image_urls_text" className="block text-sm font-medium text-text-primary mb-1">
            Image URLs (slideshow, one per line)
          </label>
          <textarea
            id="image_urls_text"
            name="image_urls_text"
            value={formData.image_urls_text}
            onChange={(e) => setFormData((prev) => ({ ...prev, image_urls_text: e.target.value }))}
            rows={4}
            placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
            className="w-full px-4 py-2.5 border border-border rounded-lg text-text-primary placeholder-text-muted bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          <p className="text-xs text-text-muted mt-1">One URL per line. Shown as a slideshow at the top of the grant page.</p>
        </div>

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'active', label: 'Active' },
            { value: 'closed', label: 'Closed' },
            { value: 'completed', label: 'Completed' },
          ]}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
          <Link href="/admin/grants">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

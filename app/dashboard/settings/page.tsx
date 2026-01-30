'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Textarea } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    twitter_handle: '',
    github_handle: '',
    website: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        display_name: user.display_name || '',
        bio: user.bio || '',
        twitter_handle: user.twitter_handle || '',
        github_handle: user.github_handle || '',
        website: user.website || '',
      })
      setIsFetching(false)
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.username.trim()) {
      setError('Username is required')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    if (!user) {
      setError('Not authenticated')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // Check if username is taken by another user
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', formData.username.toLowerCase())
        .neq('id', user.id)
        .single()

      if (existingUser) {
        setError('Username is already taken')
        setIsLoading(false)
        return
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: formData.username.toLowerCase(),
          display_name: formData.display_name.trim() || null,
          bio: formData.bio.trim() || null,
          twitter_handle: formData.twitter_handle.trim() || null,
          github_handle: formData.github_handle.trim() || null,
          website: formData.website.trim() || null,
        })
        .eq('id', user.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess('Profile updated successfully')
        // Refresh the user data in context
        await refreshUser()
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
        <div className="h-10 w-48 bg-surface-hover rounded mb-2" />
        <div className="h-4 w-64 bg-surface-hover rounded mb-8" />
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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm sm:text-base text-text-secondary mt-1">
          Manage your profile and account settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 text-sm text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-success/10 border border-success/20 text-sm text-success">
            {success}
          </div>
        )}

        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          hint="Letters, numbers, and underscores only"
          required
        />

        <Input
          label="Display Name"
          name="display_name"
          value={formData.display_name}
          onChange={handleChange}
          placeholder="Your public name"
        />

        <Textarea
          label="Bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself..."
          rows={4}
        />

        <Input
          label="Twitter Handle"
          name="twitter_handle"
          value={formData.twitter_handle}
          onChange={handleChange}
          placeholder="username (without @)"
        />

        <Input
          label="GitHub Handle"
          name="github_handle"
          value={formData.github_handle}
          onChange={handleChange}
          placeholder="username"
        />

        <Input
          label="Website"
          name="website"
          type="url"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://yourwebsite.com"
        />

        <div className="pt-4">
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/retroui/Button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export type ImageSize = 'featured' | 'inline' | 'square' | 'custom'

export interface ImageSizeConfig {
  width: number
  height: number
  label: string
}

export const IMAGE_SIZES: Record<ImageSize, ImageSizeConfig> = {
  featured: { width: 1200, height: 630, label: 'Featured (1200x630)' },
  inline: { width: 800, height: 450, label: 'Inline (800x450)' },
  square: { width: 400, height: 400, label: 'Square (400x400)' },
  custom: { width: 0, height: 0, label: 'Custom' },
}

export interface ImageUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  size?: ImageSize
  folder?: string
  className?: string
  label?: string
  hint?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  size = 'square',
  folder = 'uploads',
  className,
  label,
  hint,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(value || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeConfig = IMAGE_SIZES[size]
  const aspectRatio = size === 'custom' ? undefined : sizeConfig.width / sizeConfig.height

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const supabase = createClient()

      // Get session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please sign in to upload images')
        return
      }

      // Create unique filename
      const ext = file.name.split('.').pop()
      const filename = `${session.user.id}/${folder}/${Date.now()}.${ext}`

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError(uploadError.message || 'Failed to upload image')
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path)

      setPreview(publicUrl)
      onChange(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError('An error occurred while uploading')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [folder, onChange])

  const handleRemove = useCallback(() => {
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {preview ? (
        <div className="relative inline-block">
          <div
            className="relative border-2 border-black shadow-md overflow-hidden"
            style={{
              width: Math.min(sizeConfig.width || 200, 300),
              height: Math.min(sizeConfig.height || 200, 300) * (sizeConfig.width ? sizeConfig.height / sizeConfig.width : 1),
            }}
          >
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center border-2 border-black shadow-md hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className={cn(
            'flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-400 bg-surface hover:bg-surface-hover transition-colors cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            size === 'square' ? 'w-32 h-32' : 'w-full h-40'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload</span>
              {size !== 'custom' && (
                <span className="text-xs text-muted-foreground">
                  {sizeConfig.width} × {sizeConfig.height}
                </span>
              )}
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {hint && !error && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

// Multi-image upload for articles
export interface ArticleImageUploadProps {
  onInsert: (url: string, alt: string) => void
  className?: string
}

export function ArticleImageUpload({ onInsert, className }: ArticleImageUploadProps) {
  const [selectedSize, setSelectedSize] = useState<ImageSize>('inline')
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [altText, setAltText] = useState('')

  const handleInsert = () => {
    if (uploadedUrl) {
      onInsert(uploadedUrl, altText || 'Image')
      setUploadedUrl(null)
      setAltText('')
    }
  }

  return (
    <div className={cn('space-y-4 p-4 border-2 border-black bg-surface', className)}>
      <div className="flex gap-2">
        {(['featured', 'inline', 'square'] as ImageSize[]).map((size) => (
          <Button
            key={size}
            type="button"
            variant={selectedSize === size ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSize(size)}
          >
            {IMAGE_SIZES[size].label.split(' ')[0]}
          </Button>
        ))}
      </div>

      <ImageUpload
        value={uploadedUrl}
        onChange={setUploadedUrl}
        size={selectedSize}
        folder="articles"
        hint="Max 5MB. Supports JPG, PNG, GIF, WebP"
      />

      {uploadedUrl && (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Alt text (optional)"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="w-full px-3 py-2 border-2 border-black shadow-md"
          />
          <Button type="button" onClick={handleInsert} size="sm">
            Insert Image
          </Button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Button } from '@/components/retroui/Button'
import { Card } from '@/components/retroui/Card'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

interface NotificationBellProps {
  userId: string
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient()

      // Get notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
      setIsLoading(false)
    }

    fetchNotifications()

    // Subscribe to new notifications
    const supabase = createClient()
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center border-2 border-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 z-50 p-0 max-h-[400px] overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b-2 border-black">
            <h3 className="font-head font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-[320px]">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => markAsRead(notification.id)}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

function NotificationItem({
  notification,
  onRead,
  onClose,
}: {
  notification: Notification
  onRead: () => void
  onClose: () => void
}) {
  const handleClick = () => {
    if (!notification.is_read) {
      onRead()
    }
    onClose()
  }

  const content = (
    <div
      className={`p-3 hover:bg-muted/50 transition-colors cursor-pointer ${
        !notification.is_read ? 'bg-primary/5' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-2">
        {!notification.is_read && (
          <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
        )}
        <div className={`flex-1 min-w-0 ${notification.is_read ? 'ml-4' : ''}`}>
          <p className="text-sm font-medium truncate">{notification.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(notification.created_at)}
          </p>
        </div>
      </div>
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={handleClick}>
        {content}
      </Link>
    )
  }

  return content
}

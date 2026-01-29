'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout'
import { Card } from '@/components/retroui/Card'
import { Button } from '@/components/retroui/Button'
import { Text } from '@/components/retroui/Text'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import type { Notification } from '@/types'
import { Bell, Check, Trash2 } from 'lucide-react'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && data) {
        setNotifications(data)
      }
      setIsLoading(false)
    }

    fetchNotifications()
  }, [])

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    )
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const deleteNotification = async (notificationId: string) => {
    const supabase = createClient()
    await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)

    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const deleteAllRead = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('is_read', true)

    setNotifications(prev => prev.filter(n => !n.is_read))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Text as="h1" className="text-2xl font-head font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Notifications
          </Text>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
          {notifications.some(n => n.is_read) && (
            <Button variant="outline" size="sm" onClick={deleteAllRead}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear read
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <Text as="h2" className="text-lg font-head font-semibold mb-2">
            No notifications
          </Text>
          <p className="text-muted-foreground">
            You'll see notifications here when someone replies to your comments.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 ${!notification.is_read ? 'bg-primary/5 border-primary/20' : ''}`}
            >
              <div className="flex items-start gap-3">
                {!notification.is_read && (
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                )}
                <div className={`flex-1 min-w-0 ${notification.is_read ? 'ml-5' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {notification.link ? (
                        <Link
                          href={notification.link}
                          onClick={() => !notification.is_read && markAsRead(notification.id)}
                          className="block"
                        >
                          <Text as="h3" className="font-head font-semibold text-sm hover:text-primary">
                            {notification.title}
                          </Text>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </Link>
                      ) : (
                        <>
                          <Text as="h3" className="font-head font-semibold text-sm">
                            {notification.title}
                          </Text>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  )
}

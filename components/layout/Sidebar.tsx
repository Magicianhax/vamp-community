'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Folder,
  Plus,
  Send,
  Settings,
  Users,
  Trophy,
  BookOpen,
  FileCheck,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const icons = {
  LayoutDashboard,
  Folder,
  Plus,
  Send,
  Settings,
  Users,
  Trophy,
  BookOpen,
  FileCheck,
}

export interface SidebarLink {
  href: string
  label: string
  icon: keyof typeof icons
}

export interface SidebarProps {
  links: readonly SidebarLink[]
  title: string
  backLink?: { href: string; label: string }
}

export function Sidebar({ links, title, backLink }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-white min-h-[calc(100vh-4rem)]">
      <div className="p-6">
        {backLink && (
          <Link
            href={backLink.href}
            className="flex items-center gap-2 text-sm text-text-secondary mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            {backLink.label}
          </Link>
        )}

        <h2 className="font-semibold text-text-primary text-lg">{title}</h2>

        <nav className="mt-6 space-y-1">
          {links.map((link) => {
            const Icon = icons[link.icon]
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 text-sm font-medium',
                  isActive
                    ? 'text-primary bg-primary-light'
                    : 'text-text-secondary'
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export function MobileSidebar({ links, title }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="lg:hidden overflow-x-auto border-b border-border bg-white">
      <div className="flex items-center gap-1 p-4 min-w-max">
        {links.map((link) => {
          const Icon = icons[link.icon]
          const isActive = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap',
                isActive
                  ? 'text-primary bg-primary-light'
                  : 'text-text-secondary'
              )}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

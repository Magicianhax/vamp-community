'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, Settings, LayoutDashboard, Shield, Search, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Container } from './Container'
import { Button } from '@/components/retroui/Button'
import { Input } from '@/components/retroui/Input'
import { TwitterAvatar } from '@/components/ui/TwitterAvatar'
import { Card } from '@/components/retroui/Card'
import { SignInModal, SearchModal } from '@/components/ui'
import { NAV_LINKS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import type { User as UserType } from '@/types'

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [learnMenuOpen, setLearnMenuOpen] = useState(false)
  const learnMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const learnMenuRef = useRef<HTMLDivElement>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadUser = async () => {
      try {
        const supabase = createClient()
        console.log('Header: Creating Supabase client')

        const getUser = async () => {
          try {
            console.log('Header: Getting user...')
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
            
            if (authError) {
              console.error('Header: Auth error:', authError)
              if (mounted) setIsLoading(false)
              return
            }

            if (authUser) {
              console.log('Header: User found, fetching profile...', authUser.id)
              let { data, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single()

              // If user doesn't exist, create them
              if (profileError && profileError.code === 'PGRST116') {
                console.log('Header: User profile not found, creating...')
                const twitterUsername = authUser.user_metadata?.user_name || authUser.user_metadata?.preferred_username
                const twitterName = authUser.user_metadata?.name || authUser.user_metadata?.full_name
                const twitterAvatar = authUser.user_metadata?.avatar_url
                
                const username = twitterUsername || 
                                authUser.email?.split('@')[0] || 
                                `user_${authUser.id.slice(0, 8)}`

                const { data: newUser, error: createError } = await supabase
                  .from('users')
                  .insert({
                    id: authUser.id,
                    email: authUser.email,
                    username: username.toLowerCase(),
                    display_name: twitterName || username,
                    avatar_url: twitterAvatar || null,
                    twitter_handle: twitterUsername || null,
                  })
                  .select()
                  .single()

                if (createError) {
                  console.error('Header: Error creating user:', createError)
                } else {
                  console.log('Header: User profile created:', newUser?.username)
                  data = newUser
                  profileError = null
                }
              } else if (profileError) {
                console.error('Header: Profile error:', profileError)
              } else {
                console.log('Header: Profile loaded:', data?.username)
              }

              if (mounted) setUser(data)
            } else {
              console.log('Header: No user found')
            }
          } catch (err) {
            console.error('Header: Error in getUser:', err)
          } finally {
            if (mounted) setIsLoading(false)
          }
        }

        await getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
          console.log('Header: Auth state changed:', event)
          if (event === 'SIGNED_IN' && session?.user) {
            const { data } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()
            if (mounted) setUser(data)
          } else if (event === 'SIGNED_OUT') {
            if (mounted) setUser(null)
          }
        })

        return () => {
          mounted = false
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Header: Error initializing:', error)
        if (mounted) setIsLoading(false)
      }
    }

    const cleanup = loadUser()
    return () => {
      mounted = false
      cleanup.then(cleanupFn => cleanupFn?.())
    }
  }, [])

  // Handle hover menu with delay to prevent closing when moving to submenu
  const handleLearnMenuEnter = () => {
    if (learnMenuTimeoutRef.current) {
      clearTimeout(learnMenuTimeoutRef.current)
      learnMenuTimeoutRef.current = null
    }
    setLearnMenuOpen(true)
  }

  const handleLearnMenuLeave = () => {
    // Add small delay before closing to allow moving to submenu
    learnMenuTimeoutRef.current = setTimeout(() => {
      setLearnMenuOpen(false)
    }, 150)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setIsProfileOpen(false)
    window.location.href = '/'
  }


  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-black">
        <Container>
          <div className="flex items-center h-16 gap-4 md:gap-6">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 bg-primary border-2 border-black shadow-md flex items-center justify-center">
                <span className="text-primary-foreground font-head font-bold text-lg">V</span>
              </div>
              <span className="font-head font-bold text-xl tracking-tight">Vamp</span>
            </Link>

            {/* Search Bar (Desktop) */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="hidden md:flex items-center max-w-xs w-full"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search projects, grants..."
                  readOnly
                  className="pl-10 cursor-pointer"
                  onFocus={() => setIsSearchOpen(true)}
                />
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6 ml-4">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                const hasSubmenu = 'submenu' in link && link.submenu
                
                if (hasSubmenu) {
                  return (
                    <div 
                      key={link.href} 
                      className="relative" 
                      ref={learnMenuRef}
                      onMouseEnter={handleLearnMenuEnter}
                      onMouseLeave={handleLearnMenuLeave}
                    >
                      <Link
                        href={link.href}
                        className={cn(
                          'relative px-2 py-1 text-sm font-head font-medium transition-colors flex items-center gap-1',
                          'hover:text-foreground',
                          isActive ? 'text-foreground' : 'text-foreground',
                          'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary after:transition-all',
                          isActive ? 'after:opacity-100' : 'after:opacity-0 hover:after:opacity-100'
                        )}
                      >
                        {link.label}
                        <ChevronDown className={cn('w-3 h-3 transition-transform', learnMenuOpen && 'rotate-180')} />
                      </Link>
                      
                      {learnMenuOpen && (
                        <Card 
                          className="absolute top-full left-0 mt-0 w-48 z-50 p-0 shadow-lg"
                          onMouseEnter={handleLearnMenuEnter}
                          onMouseLeave={handleLearnMenuLeave}
                        >
                          <div className="py-1">
                            {link.submenu?.map((subItem) => {
                              const isSubActive = pathname === subItem.href || (subItem.href.includes('?') && pathname.includes(subItem.href.split('?')[0]))
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={cn(
                                    'block px-4 py-2 text-sm transition-colors',
                                    isSubActive 
                                      ? 'bg-primary/10 text-foreground font-medium' 
                                      : 'hover:bg-muted'
                                  )}
                                >
                                  {subItem.label}
                                </Link>
                              )
                            })}
                          </div>
                        </Card>
                      )}
                    </div>
                  )
                }
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative px-2 py-1 text-sm font-head font-medium transition-colors',
                      'hover:text-foreground',
                      isActive ? 'text-foreground' : 'text-foreground',
                      'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary after:transition-all',
                      isActive ? 'after:opacity-100' : 'after:opacity-0 hover:after:opacity-100'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
              {isLoading ? (
                <div className="w-9 h-9 bg-muted rounded animate-pulse" />
              ) : user ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    aria-label="User menu"
                  >
                    <TwitterAvatar
                      className="w-9 h-9"
                      src={user.avatar_url}
                      alt={user.display_name || user.username}
                      twitterHandle={user.twitter_handle}
                      userId={user.id}
                    />
                  </Button>

                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <Card className="absolute right-0 mt-2 w-64 z-50 p-0">
                        <div className="p-4 border-b-2 border-black">
                          <p className="font-head font-semibold">
                            {user.display_name || user.username}
                          </p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href={`/u/${user.username}`}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          {user.is_admin && (
                            <Link
                              href="/admin"
                              onClick={() => setIsProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-2 text-sm"
                            >
                              <Shield className="w-4 h-4" />
                              Admin Panel
                            </Link>
                          )}
                        </div>

                        <div className="border-t-2 border-black pt-1">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-2 w-full text-sm text-destructive"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </Card>
                    </>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => setIsSignInOpen(true)}
                  variant="outline"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t-2 border-black">
              {/* Mobile Search */}
              <button
                onClick={() => {
                  setIsSearchOpen(true)
                  setIsMenuOpen(false)
                }}
                className="mb-4 w-full"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type="text"
                    placeholder="Search projects, grants..."
                    readOnly
                    className="pl-10 cursor-pointer"
                  />
                </div>
              </button>

              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                  const hasSubmenu = 'submenu' in link && link.submenu
                  
                  if (hasSubmenu) {
                    return (
                      <div key={link.href} className="flex flex-col gap-1">
                        <Link
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Button
                            variant={isActive ? 'default' : 'ghost'}
                            className="w-full justify-start"
                          >
                            {link.label}
                          </Button>
                        </Link>
                        {link.submenu && (
                          <div className="pl-4 flex flex-col gap-1">
                            {link.submenu.map((subItem) => {
                              const isSubActive = pathname === subItem.href || (subItem.href.includes('?') && pathname.includes(subItem.href.split('?')[0]))
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setIsMenuOpen(false)}
                                >
                                  <Button
                                    variant={isSubActive ? 'default' : 'ghost'}
                                    className="w-full justify-start text-sm"
                                  >
                                    {subItem.label}
                                  </Button>
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  }
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className="w-full justify-start"
                      >
                        {link.label}
                      </Button>
                    </Link>
                  )
                })}
              </nav>

              {user && (
                <div className="flex flex-col gap-1 mt-4 pt-4 border-t-2 border-black">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button variant="ghost" className="w-full justify-start">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full justify-start text-destructive"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          )}
        </Container>
      </header>

      {/* Sign In Modal */}
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

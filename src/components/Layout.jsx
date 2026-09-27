import { Suspense, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useOwnerSubscription } from '../hooks/useOwnerSubscription'
import { PlanUsageCard } from './PlanUsage'
import InstallPwaButton from './InstallPwaButton'
import CommandPalette from './CommandPalette'
import NotificationBell from './NotificationBell'
import MobileNav from './MobileNav'
import ThemeToggle from './ThemeToggle'
import { Icon } from './icons'
import { Avatar } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Kbd } from './ui/kbd'
import { NAV_GROUPS, pageTitleFor, breadcrumbFor } from '../lib/nav'
import { cn } from '../lib/utils'

const UI_PREFS_KEY = 'gym-manager:ui-prefs'

function readPrefs() {
  try {
    return JSON.parse(localStorage.getItem(UI_PREFS_KEY) || '{}')
  } catch {
    return {}
  }
}

function writePrefs(prefs) {
  try {
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}

function Brand({ collapsed = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-lg shadow-brand-900/40">
        <Icon name="dumbbell" className="size-5 text-white" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-base font-extrabold text-sidebar-foreground">Gym Manager</p>
          <p className="text-[10px] font-medium uppercase tracking-widest text-sidebar-muted">Owner Portal</p>
        </div>
      )}
    </div>
  )
}

function NavGroups({ collapsed, onNavigate }) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Main navigation">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-muted">
              {group.label}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    collapsed && 'justify-center',
                    isActive
                      ? 'bg-brand-gradient text-white shadow-lg shadow-brand-900/40'
                      : 'text-sidebar-muted hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon name={item.icon} className="size-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {collapsed && isActive && (
                      <span className="absolute right-2 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-white" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

function SidebarFooter({ collapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const sub = useOwnerSubscription()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={cn('space-y-4 border-t border-sidebar/10 p-4', collapsed && 'flex flex-col items-center p-3')}>
      <InstallPwaButton collapsed={collapsed} />
      <PlanUsageCard sub={sub.current} compact collapsed={collapsed} />
      {collapsed ? (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-lg p-2 text-sidebar-muted transition hover:bg-danger-600/20 hover:text-danger-400"
          >
            <Icon name="log-out" className="size-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-sidebar-foreground/5 p-3">
          <Avatar name={user?.name} className="size-9 shrink-0 ring-2 ring-sidebar/20" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">{user?.name}</p>
            <p className="truncate text-xs text-sidebar-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-lg p-2 text-sidebar-muted transition hover:bg-danger-600/20 hover:text-danger-400"
          >
            <Icon name="log-out" className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}

function Sidebar({ collapsed, onNavigate }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn('flex h-20 shrink-0 items-center px-6', collapsed && 'justify-center px-0')}>
        <Brand collapsed={collapsed} />
      </div>
      <NavGroups collapsed={collapsed} onNavigate={onNavigate} />
      <SidebarFooter collapsed={collapsed} />
    </div>
  )
}

function ProfileMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="flex items-center gap-2 rounded-full p-1 transition hover:bg-surface-2"
        >
          <Avatar name={user?.name} className="size-9 ring-2 ring-border" />
          <Icon name="chevron-down" className="hidden size-4 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-bold text-foreground">{user?.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Icon name="settings" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/billing')}>
          <Icon name="credit-card" />
          Billing &amp; Plans
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger" onClick={handleLogout}>
          <Icon name="log-out" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Layout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => readPrefs().sidebarCollapsed ?? false)

  useEffect(() => {
    writePrefs({ sidebarCollapsed: collapsed })
  }, [collapsed])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const page = pageTitleFor(location.pathname)
  const crumbs = breadcrumbFor(location.pathname)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border-subtle lg:flex"
      >
        <Sidebar
          collapsed={collapsed}
          onNavigate={() => {
            setCollapsed(false)
          }}
        />
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="absolute -right-3 top-24 flex size-6 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-elevated transition hover:text-foreground"
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} className="size-3.5" />
        </button>
      </motion.aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 32 }}
              className="absolute inset-y-0 left-0 w-72 shadow-2xl"
            >
              <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
                <div className="flex h-20 shrink-0 items-center justify-between px-6">
                  <Brand />
                  <button
                    type="button"
                    className="rounded-lg p-2 text-sidebar-muted transition hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close menu"
                  >
                    <Icon name="x" className="size-5" />
                  </button>
                </div>
                <NavGroups collapsed={false} onNavigate={() => setSidebarOpen(false)} />
                <SidebarFooter collapsed={false} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-header/80 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-surface-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Icon name="menu" className="size-5" />
            </button>

            <div className="hidden min-w-0 flex-1 lg:block">
              {crumbs.length > 0 && (
                <p className="truncate text-sm font-bold text-foreground">{crumbs.map((c) => c.label).join(' / ')}</p>
              )}
              {page.subtitle && <p className="truncate text-xs text-muted-foreground">{page.subtitle}</p>}
            </div>

            <div className="min-w-0 flex-1 lg:hidden">
              <p className="truncate text-base font-bold text-foreground">{page.title}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted-foreground shadow-sm transition hover:bg-surface-2 hover:text-foreground md:flex"
              >
                <Icon name="search" className="size-4" />
                <span>Search</span>
                <Kbd>⌘K</Kbd>
              </button>
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground md:hidden"
                aria-label="Search"
              >
                <Icon name="search" className="size-5" />
              </button>

              <ThemeToggle className="hidden sm:flex" />

              <NotificationBell />

              <ProfileMenu />
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 sm:p-6 lg:pb-8 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Suspense fallback={null}>
                <Outlet />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <MobileNav />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

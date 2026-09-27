import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Icon } from './icons'
import { cn } from '../lib/utils'

const ITEMS = [
  { to: '/dashboard', label: 'Home', icon: 'layout-dashboard' },
  { to: '/members', label: 'Members', icon: 'users' },
  { to: '/memberships', label: 'Memberships', icon: 'shield' },
  { to: '/plans', label: 'Plans', icon: 'list' },
  { to: '/billing', label: 'Billing', icon: 'credit-card' },
]

export default function MobileNav() {
  const { pathname } = useLocation()
  const isDetail = /^\/members\/.+/.test(pathname)

  if (isDetail) return null

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-header/95 backdrop-blur-md lg:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom, 0.625rem))',
        paddingTop: '0.375rem',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center gap-0.5 py-1 text-[10px] font-semibold transition-colors',
                isActive ? 'text-brand-600' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute -top-1.5 h-0.5 w-8 rounded-b-full bg-brand-gradient"
                  />
                )}
                <Icon name={item.icon} className={cn('size-5', !isActive && 'opacity-70')} />
                <span className="leading-tight">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
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

  return (
    <AnimatePresence>
      {!isDetail && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 340, damping: 32 }}
          aria-label="Mobile navigation"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-border-subtle bg-header/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        >
          <div className="mx-auto grid max-w-lg grid-cols-5">
            {ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition',
                    isActive ? 'text-brand-600' : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="mobile-nav-active"
                        className="absolute top-0 h-0.5 w-8 rounded-b-full bg-brand-gradient"
                      />
                    )}
                    <Icon name={item.icon} className={cn('size-5', !isActive && 'opacity-70')} />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

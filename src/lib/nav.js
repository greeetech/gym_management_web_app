export const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
      { to: '/analytics', label: 'Analytics', icon: 'bar-chart' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/members', label: 'Members', icon: 'users' },
      { to: '/memberships', label: 'Memberships', icon: 'shield' },
      { to: '/plans', label: 'Subscription Plans', icon: 'list' },
      { to: '/leads', label: 'Leads', icon: 'users' },
    ],
  },
  {
    label: 'Billing',
    items: [{ to: '/billing', label: 'Billing & Plans', icon: 'credit-card' }],
  },
  {
    label: 'Account',
    items: [
      { to: '/setup', label: 'Gym Setup', icon: 'settings' },
      { to: '/website', label: 'Website Builder', icon: 'globe' },
      { to: '/settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

export const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your gym at a glance' },
  '/analytics': { title: 'Analytics', subtitle: 'Revenue, growth and membership trends' },
  '/members': { title: 'Members', subtitle: 'Manage your members' },
  '/memberships': { title: 'Memberships', subtitle: 'Track active memberships and renewals' },
  '/plans': { title: 'Subscription Plans', subtitle: 'Plan templates for your members' },
  '/leads': { title: 'Leads', subtitle: 'Capture, nurture and convert leads' },
  '/billing': { title: 'Billing & Plans', subtitle: 'Manage your gym management subscription' },
  '/settings': { title: 'Settings', subtitle: 'Preferences, profile and plan' },
  '/setup': { title: 'Gym Setup', subtitle: 'Configure your gym business' },
  '/website': { title: 'Website Builder', subtitle: 'Build and publish your public site' },
}

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

export function pageTitleFor(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (/^\/members\/.+/.test(pathname)) return { title: 'Member Profile', subtitle: '' }
  return { title: 'Gym Manager', subtitle: '' }
}

export function breadcrumbFor(pathname) {
  const exact = PAGE_TITLES[pathname]
  if (exact) return [{ label: exact.title }]
  const item = NAV_ITEMS.find((i) => pathname.startsWith(`${i.to}/`))
  if (item) return [{ label: item.label, to: item.to }, { label: 'Details' }]
  return []
}

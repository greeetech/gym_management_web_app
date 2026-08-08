import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Avatar } from './ui/avatar'
import { Kbd } from './ui/kbd'
import { Dialog, DialogTitle } from './ui/dialog'
import { Icon } from './icons'
import { NAV_ITEMS } from '../lib/nav'
import { cn } from '../lib/utils'

const QUICK_ACTIONS = [
  {
    id: 'qa-add-member',
    label: 'Add a member',
    to: '/members?new=1',
    group: 'Quick actions',
    icon: 'user-plus',
    hint: 'Go to Members',
  },
  {
    id: 'qa-new-membership',
    label: 'Create new membership',
    to: '/memberships?new=1',
    group: 'Quick actions',
    icon: 'shield',
    hint: 'Go to Memberships',
  },
  {
    id: 'qa-upgrade',
    label: 'Upgrade your plan',
    to: '/billing',
    group: 'Quick actions',
    icon: 'credit-card',
    hint: 'Go to Billing',
  },
]

function groupItems(results) {
  const groups = []
  const byGroup = {}
  for (const item of results) {
    if (!byGroup[item.group]) {
      byGroup[item.group] = []
      groups.push(item.group)
    }
    byGroup[item.group].push(item)
  }
  return groups.map((g) => ({ group: g, items: byGroup[g] }))
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [members, setMembers] = useState([])
  const [plans, setPlans] = useState([])
  const [active, setActive] = useState(0)
  const [loadingMembers, setLoadingMembers] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    setQuery('')
    setActive(0)
    setMembers([])
    setPlans([])
    const t = setTimeout(() => inputRef.current?.focus(), 30)

    let cancelled = false
    api
      .get('/subscription/get')
      .then((res) => {
        if (!cancelled) setPlans(res.data.data || [])
      })
      .catch(() => {})
    api
      .get('/members/get', { params: { limit: 5 } })
      .then((res) => {
        if (!cancelled) setMembers(res.data.data || [])
      })
      .catch(() => {})
    return () => {
      clearTimeout(t)
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open || !query.trim()) return undefined
    const t = setTimeout(() => {
      let cancelled = false
      setLoadingMembers(true)
      api
        .get('/members/get', { params: { limit: 8, search: query.trim() } })
        .then((res) => {
          if (!cancelled) setMembers(res.data.data || [])
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setLoadingMembers(false)
        })
      return () => {
        cancelled = true
      }
    }, 250)
    return () => clearTimeout(t)
  }, [query, open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pageMatches = NAV_ITEMS.filter((p) => !q || p.label.toLowerCase().includes(q)).map((p) => ({
      ...p,
      kind: 'page',
      sub: '',
    }))
    const actionMatches = QUICK_ACTIONS.filter((a) => !q || a.label.toLowerCase().includes(q)).map((a) => ({
      ...a,
      kind: 'action',
      sub: a.hint,
    }))
    const memberMatches = members.map((m) => ({
      id: `m-${m._id}`,
      label: m.fullName,
      to: `/members/${m._id}`,
      group: 'Members',
      icon: 'users',
      kind: 'member',
      sub: m.phone,
      avatar: m,
    }))
    const planMatches = plans.map((p) => ({
      id: `p-${p._id}`,
      label: p.name,
      to: '/plans',
      group: 'Plans',
      icon: 'list',
      kind: 'plan',
      sub: `${p.duration} · ₹${p.price}`,
    }))
    return [...pageMatches, ...actionMatches, ...memberMatches, ...planMatches]
  }, [query, members, plans])

  const flat = results

  useEffect(() => {
    setActive(0)
  }, [query])

  const go = (item) => {
    onClose()
    if (item.to) navigate(item.to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (flat.length ? (a + 1) % flat.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (flat.length ? (a - 1 + flat.length) % flat.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flat[active]) go(flat[active])
    }
  }

  const grouped = groupItems(results)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogTitle className="sr-only">Command palette</DialogTitle>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated">
        <div className="flex items-center gap-3 border-b border-border-subtle px-4">
          <Icon name="search" className="size-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, members, plans or run an action..."
            className="w-full bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <Kbd className="hidden shrink-0 sm:block">ESC</Kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-2" role="listbox" aria-label="Results">
          {loadingMembers && <p className="px-4 py-2 text-xs text-muted-foreground">Searching members...</p>}
          {flat.length === 0 && !loadingMembers && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for &quot;{query}&quot;
            </p>
          )}
          {grouped.map(({ group, items: groupResults }) => (
            <div key={group} className="mb-1">
              <p className="px-4 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {group}
              </p>
              {groupResults.map((item) => {
                const idx = flat.indexOf(item)
                const isActive = idx === active
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActive(idx)}
                    onClick={() => go(item)}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition',
                      isActive ? 'bg-surface-2' : '',
                    )}
                  >
                    {item.avatar?.profileImage?.url ? (
                      <Avatar name={item.label} src={item.avatar.profileImage.url} className="size-8" />
                    ) : item.avatar ? (
                      <Avatar name={item.label} className="size-8" />
                    ) : (
                      <span
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-lg',
                          isActive ? 'bg-brand-50 text-brand-700' : 'bg-surface-2 text-muted-foreground',
                        )}
                      >
                        <Icon name={item.icon} className="size-4" />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">{item.label}</span>
                      {item.sub && (
                        <span className="block truncate text-xs text-muted-foreground tabular-nums">{item.sub}</span>
                      )}
                    </span>
                    {item.kind === 'member' && <span className="shrink-0 text-xs text-muted-foreground">↵</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="hidden items-center gap-4 border-t border-border-subtle px-4 py-2 text-[10px] font-medium text-muted-foreground sm:flex">
          <span>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> navigate
          </span>
          <span>
            <Kbd>↵</Kbd> select
          </span>
          <span>
            <Kbd>esc</Kbd> close
          </span>
        </div>
      </div>
    </Dialog>
  )
}

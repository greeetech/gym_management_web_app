import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { formatDate, daysUntil } from '../utils/format'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { Icon } from './icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

export default function NotificationBell() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false
    api
      .get('/members/get', { params: { limit: 10, statusFilter: 'Expiry Soon' } })
      .then((res) => {
        if (!cancelled) setItems(res.data.data || [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const count = items.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${count ? `, ${count} memberships expiring soon` : ''}`}
          className="relative inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
        >
          <Icon name="bell" className="size-5" />
          {count > 0 && (
            <span className="absolute right-1 top-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>
            <span className="block font-bold text-foreground">Notifications</span>
            <span className="block text-xs font-normal text-muted-foreground">
              {count > 0 ? `${count} membership${count === 1 ? '' : 's'} expiring soon` : 'You are all caught up'}
            </span>
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning-50 text-warning-600">
            <Icon name="clock" className="size-4" />
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-success-50 text-success-600">
              <Icon name="check-circle" className="size-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">All clear</p>
            <p className="mt-0.5 text-xs text-muted-foreground">No memberships expiring in the next 10 days.</p>
          </div>
        ) : (
          items.map((m) => {
            const days = daysUntil(m.membershipId?.endDate)
            return (
              <DropdownMenuItem
                key={m._id}
                onSelect={() => navigate(`/members/${m._id}`)}
                className="flex items-center gap-3 py-3"
              >
                <Avatar name={m.fullName} src={m.profileImage?.url} className="size-9 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{m.fullName}</span>
                  <span className="block text-xs text-muted-foreground tabular-nums">
                    Ends {formatDate(m.membershipId?.endDate)}
                  </span>
                </span>
                <Badge variant={days !== null && days <= 3 ? 'danger' : 'warning'}>
                  {days !== null ? `${days}d` : '—'}
                </Badge>
              </DropdownMenuItem>
            )
          })
        )}

        {items.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/members?status=Expiry%20Soon" className="justify-center text-center font-semibold text-brand-600">
                View all expiring memberships
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notifications'
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
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    getNotifications({ limit: 20 })
      .then((res) => {
        setItems(res?.items || [])
        setUnread(res?.unread || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openItem = (notification) => {
    if (!notification.read) {
      markNotificationRead(notification._id)
        .then(() => setUnread((n) => Math.max(0, n - 1)))
        .catch(() => {})
    }
    if (notification.memberId) {
      navigate(`/members/${notification.memberId}`)
    }
  }

  const handleMarkAll = () => {
    markAllNotificationsRead()
      .then(() => {
        setUnread(0)
        setItems((list) => list.map((n) => ({ ...n, read: true })))
      })
      .catch(() => {})
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
          className="relative inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
        >
          <Icon name="bell" className="size-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex size-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>
            <span className="block font-bold text-foreground">Notifications</span>
            <span className="block text-xs font-normal text-muted-foreground">
              {unread > 0
                ? `${unread} unread · memberships expiring in 7 days`
                : 'You are all caught up'}
            </span>
          </span>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-warning-50 text-warning-600">
            <Icon name="clock" className="size-4" />
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {loading && items.length === 0 ? (
          <div className="flex justify-center py-8 text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-success-50 text-success-600">
              <Icon name="check-circle" className="size-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">All clear</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              No memberships expiring in the next 7 days.
            </p>
          </div>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n._id}
              onSelect={() => openItem(n)}
              className="flex items-center gap-3 py-3"
            >
              <Avatar
                name={n.member?.fullName}
                src={n.member?.profileImage?.url}
                className="size-9 shrink-0"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {n.member?.fullName || 'Member'}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {n.message || 'Membership expiring soon'}
                </span>
              </span>
              <Badge variant={n.daysLeft !== null && n.daysLeft <= 3 ? 'danger' : 'warning'}>
                {n.daysLeft !== null && n.daysLeft !== undefined ? `${n.daysLeft}d` : '—'}
              </Badge>
              {!n.read && <span className="size-2 shrink-0 rounded-full bg-brand-500" />}
            </DropdownMenuItem>
          ))
        )}

        {items.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleMarkAll}>
              <span className="justify-center text-center font-semibold text-foreground">
                Mark all as read
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/members?expiresIn=7" className="justify-center text-center font-semibold text-brand-600">
                View all expiring memberships
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

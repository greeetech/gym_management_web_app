import { useEffect, useState } from 'react'
import { useMemberships, useMembers, usePlans } from '../hooks/useQueries'
import StatusBadge from '../components/StatusBadge'
import {
  Alert,
  Button,
  DataGrid,
  PageHeader,
  NativeSelect,
  SearchInput,
} from '../components/ui'
import MembershipForm from '../components/MembershipForm'
import MembershipDetailDrawer from '../components/MembershipDetailDrawer'
import { formatDate, formatINR } from '../utils/format'
import { Icon } from '../components/icons'

const STATUS_FILTERS = ['All', 'Pending', 'Active', 'Expiry Soon', 'Expired', 'Cancelled']

export default function Memberships() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sort, setSort] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const { data, isLoading, isFetching, error, refetch } = useMemberships(
    {
      page,
      limit,
      search: debouncedSearch,
      status: statusFilter,
      sortBy: sort?.key,
      sortOrder: sort?.direction,
    },
    { placeholderData: (prev) => prev },
  )

  const plansQuery = usePlans()
  const membersQuery = useMembers({ limit: 100 })

  const plans = plansQuery.data || []
  const members = membersQuery.data?.data || []

  const [newModal, setNewModal] = useState(false)
  const [detailId, setDetailId] = useState(null)
  const [renewMemberId, setRenewMemberId] = useState(null)

  const memberships = data?.data || []
  const pagination = data?.pagination

  const openNewMembership = () => {
    setRenewMemberId(null)
    setNewModal(true)
  }

  const columns = [
    {
      key: 'gymMemberId',
      label: 'Member',
      sortable: true,
      render: (m) => (
        <div>
          <p className="font-semibold text-foreground">{m.gymMemberId?.fullName || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground tabular-nums">{m.gymMemberId?.phone}</p>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Plan',
      sortable: true,
      render: (m) => <span className="font-medium text-foreground">{m.name}</span>,
    },
    {
      key: 'price',
      label: 'Amount',
      sortable: true,
      render: (m) => (
        <span className="text-muted-foreground tabular-nums">
          {formatINR(m.price)}
          {m.grossPrice > m.price && (
            <span className="ml-1.5 text-xs text-muted-foreground line-through">
              {formatINR(m.grossPrice)}
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (m) => <span className="text-muted-foreground">{m.duration}</span>,
    },
    {
      key: 'startDate',
      label: 'Start',
      sortable: true,
      render: (m) => <span className="text-muted-foreground tabular-nums">{formatDate(m.startDate)}</span>,
    },
    {
      key: 'endDate',
      label: 'End',
      sortable: true,
      render: (m) => <span className="text-muted-foreground tabular-nums">{formatDate(m.endDate)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (m) => <StatusBadge status={m.status} />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Memberships"
        subtitle="Track and manage all member subscriptions"
        breadcrumb="Management"
        icon="shield"
        action={
          <Button onClick={openNewMembership}>
            <Icon name="plus" className="size-4" />
            New Membership
          </Button>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert>{error.message}</Alert>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Search by plan name..."
        />
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-muted-foreground sm:block">Status:</span>
          <NativeSelect
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="w-44"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <DataGrid
        columns={columns}
        data={memberships}
        loading={isLoading && !memberships.length}
        error={error}
        sort={sort}
        onSort={setSort}
        serverSort
        rowKey={(m) => m._id}
        onRowClick={(m) => setDetailId(m._id)}
        pagination={pagination}
        onPageChange={setPage}
        emptyState={{
          title: 'No memberships found',
          message: 'No memberships match your current filters.',
          icon: 'shield',
          action: <Button onClick={openNewMembership}>New Membership</Button>,
        }}
        className={isFetching && memberships.length ? 'opacity-80 transition-opacity' : undefined}
      />

      <MembershipForm
        open={newModal}
        onClose={() => setNewModal(false)}
        memberId={renewMemberId}
        members={members}
        membersLoading={membersQuery.isLoading}
        plans={plans}
        plansLoading={plansQuery.isLoading}
        onSuccess={refetch}
      />

      <MembershipDetailDrawer
        open={!!detailId}
        membershipId={detailId}
        onClose={() => setDetailId(null)}
        onChanged={refetch}
        onRenew={(d) => {
          setRenewMemberId(d?.gymMemberId?._id || null)
          setDetailId(null)
          setNewModal(true)
        }}
      />
    </div>
  )
}

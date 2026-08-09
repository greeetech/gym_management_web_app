import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import { useMembers, usePlans, useDeleteMember, useUpdateProfilePic } from '../hooks/useQueries'
import { useOwnerSubscription } from '../hooks/useOwnerSubscription'
import { useToast } from '../components/Toast'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import StatusBadge from '../components/StatusBadge'
import {
  Alert,
  Avatar,
  Button,
  DataGrid,
  PageHeader,
  inputClass,
  NativeSelect,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../components/ui'
import { Icon } from '../components/icons'
import MemberForm from '../components/MemberForm'
import MembershipForm from '../components/MembershipForm'
import ExpiryFilter from '../components/ExpiryFilter'
import WhatsAppSender from '../components/WhatsAppSender'
import { formatDate } from '../utils/format'
import { exportRowsToCSV } from '../utils/csv'

const STATUS_FILTERS = ['All', 'Pending', 'Active', 'Inactive', 'Expiry Soon', 'Expired', 'Cancelled']

const CSV_COLUMNS = [
  { label: 'Name', value: (m) => m.fullName },
  { label: 'Email', value: (m) => m.email },
  { label: 'Phone', value: (m) => m.phone },
  { label: 'Gender', value: (m) => m.gender },
  { label: 'Age', value: (m) => m.age ?? '' },
  { label: 'Weight (kg)', value: (m) => m.weight ?? '' },
  { label: 'Status', value: (m) => m.membershipId?.status || '' },
  { label: 'Start Date', value: (m) => m.membershipId?.startDate || '' },
  { label: 'End Date', value: (m) => m.membershipId?.endDate || '' },
]

export default function Members() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  const subscription = useOwnerSubscription()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All')
  const [expiresIn, setExpiresIn] = useState(() => {
    const v = searchParams.get('expiresIn')
    return v && Number(v) > 0 ? Number(v) : ''
  })
  const [sort, setSort] = useState(null)

  const { data, isLoading, isFetching, error, refetch } = useMembers({
    page,
    limit,
    search: debouncedSearch,
    statusFilter,
    ...(expiresIn ? { expiresIn } : {}),
    ...(sort?.key ? { sortBy: sort.key, sortOrder: sort.direction } : {}),
  })

  const plansQuery = usePlans()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const deleteMutation = useDeleteMember()
  const picMutation = useUpdateProfilePic()

  const [renewTarget, setRenewTarget] = useState(null)
  const [renewOpen, setRenewOpen] = useState(false)

  const [picTarget, setPicTarget] = useState(null)
  const [picFile, setPicFile] = useState(null)
  const [picPreview, setPicPreview] = useState('')
  const [picError, setPicError] = useState('')

  const [waTarget, setWaTarget] = useState(null)

  const [exporting, setExporting] = useState(null)

  const members = data?.data || []
  const pagination = data?.pagination
  const plans = plansQuery.data || []

  const handleSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (member) => {
    setEditing(member)
    setFormOpen(true)
  }

  const onMemberSuccess = () => {
    refetch()
    subscription.refresh()
  }

  const handleDelete = () => {
    deleteMutation.mutate(deleteTarget._id, {
      onSuccess: () => {
        setDeleteTarget(null)
        refetch()
        subscription.refresh()
      },
    })
  }

  const openPicUpload = (member) => {
    setPicTarget(member)
    setPicFile(null)
    setPicPreview('')
    setPicError('')
  }

  const onPicSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (picPreview) URL.revokeObjectURL(picPreview)
    setPicFile(file)
    setPicPreview(URL.createObjectURL(file))
    setPicError('')
  }

  const handlePicUpload = async (e) => {
    e.preventDefault()
    if (!picFile) {
      setPicError('Please choose an image first')
      return
    }
    const fd = new FormData()
    fd.append('profileImage', picFile)
    picMutation.mutate(
      { id: picTarget._id, formData: fd },
      {
        onSuccess: () => {
          setPicTarget(null)
          setPicFile(null)
          if (picPreview) URL.revokeObjectURL(picPreview)
          setPicPreview('')
          refetch()
        },
        onError: (err) => setPicError(getErrorMessage(err)),
      },
    )
  }

  const exportCurrent = () => {
    exportRowsToCSV('gym_members.csv', members, CSV_COLUMNS)
    toast.success('Current page exported to CSV')
  }

  const exportAll = async () => {
    setExporting('all')
    try {
      const res = await api.get('/members/get', {
        params: { limit: 100, search: debouncedSearch, statusFilter },
      })
      const rows = res.data.data || []
      exportRowsToCSV('gym_members.csv', rows, CSV_COLUMNS)
      toast.success('All matching members exported to CSV')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setExporting(null)
    }
  }

  const openRenew = (member) => {
    setRenewTarget(member)
    setRenewOpen(true)
  }

  const columns = [
    {
      key: 'fullName',
      label: 'Member',
      sortable: true,
      render: (m) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={m.profileImage?.url}
            name={m.fullName}
            alt={m.fullName}
            className="size-10 rounded-full text-sm font-bold"
          />
          <div>
            <p className="font-semibold text-foreground">{m.fullName}</p>
            <p className="text-xs text-muted-foreground">{m.gender}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Contact',
      sortable: true,
      render: (m) => (
        <div className="text-muted-foreground">
          <p>{m.email}</p>
          <p className="text-xs tabular-nums">{m.phone}</p>
        </div>
      ),
    },
    {
      key: 'age',
      label: 'Age / Weight',
      sortable: true,
      render: (m) => (
        <span className="text-muted-foreground tabular-nums">
          {m.age ?? '—'} yrs / {m.weight ?? '—'} kg
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (m) => <StatusBadge status={m.membershipId?.status} />,
    },
    {
      key: 'startDate',
      label: 'Valid From',
      sortable: true,
      render: (m) => (
        <span className="text-muted-foreground tabular-nums">{formatDate(m.membershipId?.startDate)}</span>
      ),
    },
    {
      key: 'endDate',
      label: 'Valid Till',
      sortable: true,
      render: (m) => (
        <span className="text-muted-foreground tabular-nums">{formatDate(m.membershipId?.endDate)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (m) => (
        <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="Actions"
                aria-label={`Actions for ${m.fullName}`}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-surface-2 hover:text-foreground"
              >
                <Icon name="menu" className="size-4.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onSelect={() => openRenew(m)}>
                <Icon name="refresh" />
                Renew / New membership
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openEdit(m)}>
                <Icon name="pencil" />
                Edit details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openPicUpload(m)}>
                <Icon name="image" />
                Update photo
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setWaTarget(m)}>
                <Icon name="message-circle" />
                Send WhatsApp
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="danger" onSelect={() => setDeleteTarget(m)}>
                <Icon name="trash" />
                Delete member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle="Manage your gym members and their memberships"
        breadcrumb="Management"
        action={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" disabled={members.length === 0}>
                  <Icon name="download" />
                  {exporting === 'all' ? 'Exporting...' : 'Export'}
                  <Icon name="chevron-down" className="size-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuItem onSelect={exportCurrent}>
                  <Icon name="download" />
                  Export current page
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={exportAll}>
                  <Icon name="file" />
                  Export all matching (up to 100)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={openAdd}>
              <Icon name="plus" />
              Add Member
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert>{error.message}</Alert>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search members by name, phone or email..."
            className={inputClass(false, 'pl-10')}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
          <ExpiryFilter
            value={expiresIn}
            onChange={(v) => {
              setExpiresIn(v)
              setPage(1)
              const next = new URLSearchParams(searchParams)
              if (v) next.set('expiresIn', String(v))
              else next.delete('expiresIn')
              setSearchParams(next, { replace: true })
            }}
          />
        </div>
      </div>

      <DataGrid
        columns={columns}
        data={members}
        loading={isLoading && !members.length}
        error={error}
        sort={sort}
        onSort={setSort}
        serverSort
        rowKey={(m) => m._id}
        onRowClick={(m) => navigate(`/members/${m._id}`)}
        pagination={pagination}
        onPageChange={setPage}
        emptyState={{
          title: 'No members found',
          message: 'No members match your search. Try a different filter or add a new member.',
          icon: 'users',
          action: <Button onClick={openAdd}>Add Member</Button>,
        }}
        className={isFetching && members.length ? 'opacity-80 transition-opacity' : undefined}
      />

      <MemberForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        mode={editing ? 'edit' : 'add'}
        member={editing}
        plans={plans}
        plansLoading={plansQuery.isLoading}
        plansError={plansQuery.error}
        onSuccess={onMemberSuccess}
      />

      <MembershipForm
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        memberId={renewTarget?._id}
        members={members}
        plans={plans}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete member"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}?`}
        confirmText="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Modal
        open={!!picTarget}
        title={`Update photo - ${picTarget?.fullName || ''}`}
        onClose={() => setPicTarget(null)}
        size="sm"
      >
        {picError && (
          <div className="mb-4">
            <Alert>{picError}</Alert>
          </div>
        )}
        <form onSubmit={handlePicUpload} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-muted-foreground">
              {picPreview ? (
                <img src={picPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : picTarget?.profileImage?.url ? (
                <img src={picTarget.profileImage.url} alt={picTarget.fullName} className="h-full w-full object-cover" />
              ) : (
                <Icon name="image" className="size-8" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onPicSelect}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-500/20 dark:file:text-brand-400"
              />
              <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG or WebP. Max 4 MB.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPicTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" loading={picMutation.isPending}>
              {picMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Modal>

      <WhatsAppSender
        open={!!waTarget}
        onClose={() => setWaTarget(null)}
        member={waTarget}
        membership={waTarget?.membershipId}
      />
    </div>
  )
}

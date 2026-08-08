import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMember, usePlans, useUpdateProfilePic } from '../hooks/useQueries'
import { useOwnerSubscription } from '../hooks/useOwnerSubscription'
import { useToast } from '../components/Toast'
import StatusBadge from '../components/StatusBadge'
import Modal from '../components/Modal'
import MemberForm from '../components/MemberForm'
import MembershipForm from '../components/MembershipForm'
import { Alert, Avatar, Button, Card, EmptyState, Field, PageHeader, inputClass } from '../components/ui'
import { Icon } from '../components/icons'
import { formatDate, formatINR } from '../utils/format'

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-border-subtle py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value || '—'}</span>
    </div>
  )
}

function MembershipCard({ membership }) {
  if (!membership) {
    return (
      <Card>
        <EmptyState title="No membership" message="This member does not have a membership yet." />
      </Card>
    )
  }
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
        <h3 className="text-sm font-bold text-foreground">Membership</h3>
        <StatusBadge status={membership.status} />
      </div>
      <div className="px-6 py-2">
        <div className="mt-2">
          <p className="text-2xl font-extrabold tracking-tight text-foreground">{membership.name}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-bold text-brand-600 tabular-nums">{formatINR(membership.price)}</span>
            {membership.grossPrice > membership.price && (
              <span className="text-sm text-muted-foreground line-through tabular-nums">{formatINR(membership.grossPrice)}</span>
            )}
            <span className="text-sm text-muted-foreground">/ {membership.duration}</span>
          </div>
        </div>
        <div className="mt-2">
          <DetailRow label="Start date" value={formatDate(membership.startDate)} />
          <DetailRow label="End date" value={formatDate(membership.endDate)} />
          <DetailRow label="Status" value={membership.status} />
        </div>
      </div>
    </Card>
  )
}

export default function MemberDetail() {
  const { id } = useParams()
  const toast = useToast()
  const subscription = useOwnerSubscription()
  const { data: member, isLoading, error, refetch } = useMember(id)
  const plansQuery = usePlans()

  const [editOpen, setEditOpen] = useState(false)
  const [renewOpen, setRenewOpen] = useState(false)
  const [picOpen, setPicOpen] = useState(false)
  const [picFile, setPicFile] = useState(null)
  const [picPreview, setPicPreview] = useState('')
  const [picError, setPicError] = useState('')

  const picMutation = useUpdateProfilePic()

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-10 animate-spin rounded-full border-2 border-border border-t-brand-600" />
      </div>
    )
  }

  if (error) {
    return <Alert>{error.message}</Alert>
  }

  if (!member) {
    return <EmptyState title="Member not found" message="The member you are looking for does not exist." />
  }

  const membership = member.membershipId || null
  const plans = plansQuery.data || []

  const handlePicSubmit = async (e) => {
    e.preventDefault()
    if (!picFile) {
      setPicError('Please choose an image first')
      return
    }
    setPicError('')
    const fd = new FormData()
    fd.append('profileImage', picFile)
    picMutation.mutate(
      { id: member._id, formData: fd },
      {
        onSuccess: () => {
          setPicOpen(false)
          if (picPreview) URL.revokeObjectURL(picPreview)
          toast.success('Profile photo updated')
          refetch()
        },
        onError: (err) => setPicError(err?.response?.data?.message || err?.message || 'Could not upload photo'),
      },
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link
          to="/members"
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-brand-600"
        >
          <Icon name="chevron-left" className="size-4" />
          Back to members
        </Link>
        <PageHeader title={member.fullName} subtitle="Member profile and membership details" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-1">
          <div className="relative flex flex-col items-center bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-8 text-center">
            {member.profileImage?.url ? (
              <img
                src={member.profileImage.url}
                alt={member.fullName}
                className="size-24 rounded-2xl object-cover ring-4 ring-white/20"
              />
            ) : (
              <Avatar name={member.fullName} alt={member.fullName} className="size-24 rounded-2xl text-3xl font-extrabold ring-4 ring-white/20" />
            )}
            <button
              type="button"
              onClick={() => {
                setPicOpen(true)
                setPicFile(null)
                setPicPreview('')
                setPicError('')
              }}
              className="absolute right-3 top-3 rounded-lg bg-white/10 p-2 text-white/80 backdrop-blur transition hover:bg-white/20 hover:text-white"
              aria-label="Update photo"
              title="Update photo"
            >
              <Icon name="image" className="size-4" />
            </button>
            <p className="mt-4 text-lg font-bold text-white">{member.fullName}</p>
            <p className="text-sm text-slate-300">{member.gender}</p>
          </div>
          <div className="px-6 py-4">
            <DetailRow label="Age" value={member.age ? `${member.age} yrs` : null} />
            <DetailRow label="Weight" value={member.weight ? `${member.weight} kg` : null} />
            <DetailRow label="Phone" value={member.phone} />
            <DetailRow label="Email" value={member.email} />
            <DetailRow label="Joined" value={formatDate(member.createdAt)} />
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <MembershipCard membership={membership} />
          <Card className="overflow-hidden">
            <div className="border-b border-border-subtle px-6 py-4">
              <h3 className="text-sm font-bold text-foreground">Quick actions</h3>
            </div>
            <div className="flex flex-wrap gap-3 px-6 py-4">
              <Button onClick={() => setEditOpen(true)}>
                <Icon name="pencil" className="size-4" />
                Edit details
              </Button>
              <Button variant="secondary" onClick={() => setRenewOpen(true)}>
                <Icon name="refresh" className="size-4" />
                Renew / New membership
              </Button>
              <Link
                to="/memberships"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-2"
              >
                View all memberships
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <MemberForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        member={member}
        plans={plans}
        plansLoading={plansQuery.isLoading}
        plansError={plansQuery.error}
        onSuccess={() => {
          refetch()
          subscription.refresh()
        }}
      />

      <MembershipForm
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        memberId={member._id}
        members={[member]}
        plans={plans}
        onSuccess={refetch}
      />

      <Modal open={picOpen} title="Update photo" onClose={() => setPicOpen(false)} size="sm">
        {picError && (
          <div className="mb-4">
            <Alert>{picError}</Alert>
          </div>
        )}
        <form onSubmit={handlePicSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 text-muted-foreground">
              {picPreview ? (
                <img src={picPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : member.profileImage?.url ? (
                <img src={member.profileImage.url} alt={member.fullName} className="h-full w-full object-cover" />
              ) : (
                <Icon name="image" className="size-8" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Field label="Choose image">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    if (picPreview) URL.revokeObjectURL(picPreview)
                    setPicFile(file)
                    setPicPreview(URL.createObjectURL(file))
                    setPicError('')
                  }}
                  className={inputClass(false)}
                />
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setPicOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={picMutation.isPending}>
              {picMutation.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

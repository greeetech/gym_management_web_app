import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api, { getErrorMessage } from '../services/api'
import { queryKeys } from '../services/queryClient'
import { useToast } from '../components/Toast'

/* ------------------------------ Members ------------------------------ */

export function useMembers(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.members(params),
    queryFn: async () => {
      const res = await api.get('/members/get', { params })
      return res.data
    },
    ...options,
  })
}

export function useMember(id, options = {}) {
  return useQuery({
    queryKey: queryKeys.member(id),
    queryFn: async () => {
      const res = await api.get(`/members/get/${id}`)
      return res.data?.data || res.data
    },
    enabled: !!id,
    ...options,
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/members/add', payload)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members(undefined) })
      qc.invalidateQueries({ queryKey: queryKeys.analytics })
      toast?.success?.('Member added')
    },
    onError: (err) => {
      toast?.error?.(getErrorMessage(err, 'Failed to add member'))
    },
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/members/update/${id}`, payload)
      return res.data
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.members(undefined) })
      qc.invalidateQueries({ queryKey: queryKeys.member(vars.id) })
      toast?.success?.('Member updated')
    },
    onError: (err) => {
      toast?.error?.(getErrorMessage(err, 'Failed to update member'))
    },
  })
}

export function useDeleteMember() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/members/delete/${id}`)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.members(undefined) })
      qc.invalidateQueries({ queryKey: queryKeys.analytics })
      toast?.success?.('Member removed')
    },
    onError: (err) => {
      toast?.error?.(getErrorMessage(err, 'Failed to delete member'))
    },
  })
}

export function useUpdateProfilePic() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const res = await api.put(`/members/profile-pic/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.members(undefined) })
      qc.invalidateQueries({ queryKey: queryKeys.member(vars.id) })
      toast?.success?.('Profile photo updated')
    },
    onError: (err) => {
      toast?.error?.(getErrorMessage(err, 'Failed to update photo'))
    },
  })
}

/* ----------------------------- Memberships ---------------------------- */

export function useMemberships(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.memberships(params),
    queryFn: async () => {
      const res = await api.get('/memberships/', { params })
      return res.data
    },
    ...options,
  })
}

export function useUpdateMembership() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/memberships/${id}`, payload)
      return res.data
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.memberships(undefined) })
      qc.invalidateQueries({ queryKey: queryKeys.member(vars.id) })
      toast?.success?.('Membership updated')
    },
    onError: (err) => {
      toast?.error?.(getErrorMessage(err, 'Failed to update membership'))
    },
  })
}

/* ------------------------------- Plans ------------------------------- */

export function usePlans(options = {}) {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: async () => {
      const res = await api.get('/subscription/get')
      return res.data?.data || []
    },
    ...options,
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/subscription/add', payload)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.plans })
      toast?.success?.('Plan created')
    },
    onError: (err) => {
      toast?.error?.(getErrorMessage(err, 'Failed to create plan'))
    },
  })
}

export function useUpdatePlan() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await api.put(`/subscription/update/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.plans })
      toast?.success?.('Plan updated')
    },
    onError: (err) => {
      toast?.error?.(getErrorMessage(err, 'Failed to update plan'))
    },
  })
}

export function useDeletePlan() {
  const qc = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/subscription/del/${id}`)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.plans })
      toast?.success?.('Plan deleted')
    },
    onError: (err) => {
      toast?.error?.(getErrorMessage(err, 'Failed to delete plan'))
    },
  })
}

/* ----------------------------- Payments ----------------------------- */

export function usePayments(params, options = {}) {
  return useQuery({
    queryKey: queryKeys.payments(params),
    queryFn: async () => {
      const res = await api.get('/payment/history', { params })
      return res.data
    },
    ...options,
  })
}

export function usePaymentPlans(options = {}) {
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: async () => {
      const res = await api.get('/payment/plans')
      return res.data?.data || []
    },
    ...options,
  })
}

/* ----------------------------- Analytics ---------------------------- */

export function useAnalytics(options = {}) {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: async () => {
      const res = await api.get('/analytics/')
      return res.data
    },
    ...options,
  })
}

export function useMembershipStatusCounts(options = {}) {
  return useQuery({
    queryKey: queryKeys.membershipStatusCounts,
    queryFn: async () => {
      const res = await api.get('/analytics/membership-status-counts')
      return res.data
    },
    ...options,
  })
}

/* ------------------------------- Profile ---------------------------- */

export function useProfile(options = {}) {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const res = await api.get('/profile')
      return res.data?.data || res.data
    },
    ...options,
  })
}

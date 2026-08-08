import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const queryKeys = {
  analytics: ['analytics'],
  membershipStatusCounts: ['analytics', 'membership-status-counts'],
  members: (params) => ['members', params],
  member: (id) => ['member', id],
  memberships: (params) => ['memberships', params],
  plans: ['plans'],
  payments: (params) => ['payments', params],
  profile: ['profile'],
  subscription: ['subscription'],
}

import axios from 'axios'

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/gym_owner', '') : '',
})

export function fetchPublicSite(slug) {
  return publicApi.get(`/public/g/${slug}`).then((r) => r.data.data)
}

export function fetchPublicMemberships(slug) {
  return publicApi.get(`/public/g/${slug}/memberships`).then((r) => r.data.data)
}

export function fetchPublicContent(slug) {
  return publicApi.get(`/public/g/${slug}/content`).then((r) => r.data.data)
}

export function submitPublicLead(slug, payload) {
  return publicApi.post(`/public/g/${slug}/leads`, payload).then((r) => r.data.data)
}

export function publicQrUrl(slug) {
  const base = (import.meta.env.VITE_API_URL || '/gym_owner').replace('/gym_owner', '')
  return `${base}/public/g/${slug}/qr`
}

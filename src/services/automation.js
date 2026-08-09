import api from './api'

export function getAutomationRules(params) {
  return api.get('/automation', { params }).then((r) => r.data.data)
}

export function createAutomationRule(payload) {
  return api.post('/automation', payload).then((r) => r.data.data)
}

export function updateAutomationRule(id, payload) {
  return api.put(`/automation/${id}`, payload).then((r) => r.data.data)
}

export function toggleAutomationRule(id) {
  return api.patch(`/automation/${id}/toggle`).then((r) => r.data.data)
}

export function runAutomationRule(id) {
  return api.post(`/automation/${id}/run`).then((r) => r.data.data)
}

export function deleteAutomationRule(id) {
  return api.delete(`/automation/${id}`).then((r) => r.data.data)
}

import api from './api'

export function getLeads(params) {
  return api.get('/leads', { params }).then((r) => r.data.data)
}

export function createLead(payload) {
  return api.post('/leads', payload).then((r) => r.data.data)
}

export function updateLead(id, payload) {
  return api.put(`/leads/${id}`, payload).then((r) => r.data.data)
}

export function updateLeadStatus(id, status) {
  return api.patch(`/leads/${id}/status`, { status }).then((r) => r.data.data)
}

export function addLeadNote(id, text) {
  return api.post(`/leads/${id}/notes`, { text }).then((r) => r.data.data)
}

export function convertLead(id, payload) {
  return api.post(`/leads/${id}/convert`, payload).then((r) => r.data.data)
}

export function deleteLead(id) {
  return api.delete(`/leads/${id}`).then((r) => r.data.data)
}

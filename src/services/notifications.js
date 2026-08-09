import api from './api'

export function getNotifications(params) {
  return api.get('/notifications', { params }).then((r) => r.data.data)
}

export function markNotificationRead(id) {
  return api.patch(`/notifications/${id}/read`).then((r) => r.data.data)
}

export function markAllNotificationsRead() {
  return api.patch('/notifications/read-all').then((r) => r.data.data)
}

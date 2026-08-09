import api from './api'

export function getGymSetup() {
  return api.get('/setup').then((r) => r.data.data)
}

export function getSetupStatus() {
  return api.get('/setup/status').then((r) => r.data.data)
}

export function saveSetupStep(step, payload) {
  return api.put(`/setup/step/${step}`, payload).then((r) => r.data.data)
}

export function completeSetup() {
  return api.post('/setup/complete').then((r) => r.data.data)
}

export function toggleSetupPublish(publish) {
  return api.post('/setup/publish', { publish }).then((r) => r.data.data)
}

export function uploadSetupImage(file, folder) {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder || 'general')
  return api.post('/setup/upload', form).then((r) => r.data.data)
}

export function deleteSetupImage(publicId) {
  return api.post('/setup/delete-image', { publicId }).then((r) => r.data.data)
}

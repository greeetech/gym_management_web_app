import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/gym_owner',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gym_owner_token')
  if (token) {
    config.headers['x-auth-token'] = token
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gym_owner_token')
      localStorage.removeItem('gym_owner_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data
  return data?.message || error?.message || fallback
}

export default api

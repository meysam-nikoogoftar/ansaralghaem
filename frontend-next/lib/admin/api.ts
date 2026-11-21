import { browserRequest, type BrowserRequestOptions } from '@/lib/api/browser'

const decode = (data: unknown) => data

function request(path: string, options?: BrowserRequestOptions) {
  return browserRequest(path, decode, { ...options, authenticated: true })
}

const api = {
  get: (path: string, options?: Pick<BrowserRequestOptions, 'signal' | 'responseType'>) =>
    request(path, options),
  post: (path: string, body: unknown) => request(path, { method: 'POST', body }),
  put: (path: string, body: unknown) => request(path, { method: 'PUT', body }),
  patch: (path: string, body: unknown) => request(path, { method: 'PATCH', body }),
  delete: (path: string) => request(path, { method: 'DELETE', body: {} }),
}

export default api

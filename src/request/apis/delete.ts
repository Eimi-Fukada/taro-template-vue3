import makeRequest from '../httpsRequest'

const method = 'DELETE'

export default {
  '/list': makeRequest<null, { username: string; password: string }>({
    url: '/list',
    method,
  }),
}

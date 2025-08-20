import makeRequest from '../httpsRequest'

const method = 'PUT'

export default {
  '/password': makeRequest<null, { password: string }, { username: string }>({
    url: '/password',
    method,
  }),
}

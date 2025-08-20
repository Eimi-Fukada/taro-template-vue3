import makeRequest from '../httpsRequest'

const method = 'GET'

export default {
  '/userInfo/{username}': makeRequest<{ username: string }>({
    url: '/userInfo/{username}',
    method,
  }),
}

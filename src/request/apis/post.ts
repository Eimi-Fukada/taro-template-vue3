import makeRequest from '../httpsRequest'

const method = 'POST'

export default {
  '/category/list': makeRequest<
    null,
    { pageSize: number; pageNum: number },
    { name: string }
  >({
    url: '/category/list',
    method,
  }),
  '/ticketing/queryByTicketIdV2': makeRequest<null, { ticketId: number }>({
    url: '/ticketing/queryByTicketIdV2',
    method,
  }),
  '/event/detail': makeRequest<null, { categoryId: number }>({
    url: '/event/detail',
    method,
  }),
}

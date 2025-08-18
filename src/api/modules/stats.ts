import request from '../request'

export const getStats = () => {
  return request.get('/stats')
}

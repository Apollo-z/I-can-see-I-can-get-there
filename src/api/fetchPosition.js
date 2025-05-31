import request from '@/utils/request.js'

export function fetchPosition() {
  return request({
    url: 'http://47.122.123.251:2345/api/go2/position/current',
    method: 'get',
  })
}

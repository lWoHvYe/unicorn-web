import request from '@/utils/request'

/**
 * 上传文件到指定接口。
 * api 已经是带前缀的完整地址（如 /api/localStorage/pictures），
 * 因此这里覆盖 baseURL，避免与 request 实例的 baseURL 重复拼接。
 * 返回 response.data（与 request 拦截器保持一致）。
 */
export function upload(api, file) {
  const data = new FormData()
  data.append('file', file)
  return request({
    url: api,
    method: 'post',
    data,
    baseURL: ''
  })
}

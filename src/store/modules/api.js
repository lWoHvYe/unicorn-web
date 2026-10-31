// 适配 Nginx 反向代理
const configuredBaseUrl = import.meta.env.VUE_APP_BASE_API === '/'
  ? ''
  : (import.meta.env.VUE_APP_BASE_API || '')
// 开发环境统一走 Vite 代理，避免 CORS 与自签名证书问题；
// 生产环境仍使用 VUE_APP_BASE_API（通常为 /server-api）。
const baseUrl = import.meta.env.DEV ? '' : configuredBaseUrl
const serverUrl = configuredBaseUrl
const api = {
  state: {
    // 部署包上传
    deployUploadApi: baseUrl + '/api/deploy/upload',
    // SQL脚本上传
    databaseUploadApi: baseUrl + '/api/database/upload',
    // 图片上传
    imagesUploadApi: baseUrl + '/api/localStorage/pictures',
    // 修改头像
    updateAvatarApi: baseUrl + '/api/sys/users/updateAvatar',
    // 上传文件到七牛云
    qiNiuUploadApi: baseUrl + '/api/qiNiuContent',
    // Sql 监控（独立后端页面，开发环境直接访问后端）
    sqlApi: serverUrl + '/druid/index.html',
    // swagger（独立后端页面）
    swaggerApi: serverUrl + '/swagger-ui/index.html',
    // 文件上传
    fileUploadApi: baseUrl + '/api/localStorage',
    // 文件/头像访问前缀
    baseApi: baseUrl
  }
}

export default api

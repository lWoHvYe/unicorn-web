import axios from 'axios'
import router from '@/router/routers'
import { ElNotification } from 'element-plus'
import store from '../store'
import { getToken } from '@/utils/auth'
import Config from '@/settings'
import Cookies from 'js-cookie'

const notifyError = (title) => {
  ElNotification.error({
    title: String(title || '请求失败'),
    duration: 5000
  })
}

// 并发 401 时只允许一个退出流程，避免 LogOut -> logout 接口 401 -> LogOut 的递归
let isLoggingOut = false

const getErrorMessage = (error) => {
  const response = error && error.response
  const data = response && response.data
  if (data === undefined || data === null) {
    if (error && (error.code === 'ECONNABORTED' || String(error.message || '').includes('timeout'))) {
      return '网络请求超时'
    }
    return response ? `请求失败（${response.status}）` : '网络连接异常'
  }
  if (typeof data === 'string') {
    // 避免把 Nginx/网关返回的整页 HTML 错误提示给用户
    return data.trim().startsWith('<') || data.length > 200
      ? `请求失败（${response && response.status ? response.status : '未知状态'}）`
      : data
  }
  const message = data.message || data.description
  if (message) {
    return String(message)
  }
  const code = data.status || data.businessCode || (response && response.status)
  return code ? `请求失败（${code}）` : '接口请求失败'
}

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.PROD ? import.meta.env.VUE_APP_BASE_API : '/', // api 的 base_url
  timeout: Config.timeout // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = token // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    // 不在这里写死 Content-Type：交给 axios 根据 JSON / FormData 自动设置，
    // 否则 multipart 上传会缺少 boundary。
    return config
  },
  error => Promise.reject(error)
)

// response 拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    const responseData = error.response && error.response.data
    // 兼容 blob 下载出错时返回 JSON 的情况
    if (responseData instanceof Blob && responseData.type.toLowerCase().indexOf('json') !== -1) {
      const reader = new FileReader()
      reader.onload = function() {
        try {
          const data = JSON.parse(reader.result)
          notifyError(data.message || data.description || '下载失败')
        } catch (e) {
          notifyError('下载失败')
        }
      }
      reader.onerror = () => notifyError('下载失败')
      reader.readAsText(responseData, 'utf-8')
      return Promise.reject(error)
    }

    const status = Number(
      (responseData && (responseData.status || responseData.businessCode)) ||
      (error.response && error.response.status) ||
      0
    )

    if (status === 401) {
      // 登录接口本身返回 401 时没有 token，不应触发退出/刷新，
      // 否则会把“密码错误”变成“登录状态过期”。
      if (!getToken()) {
        notifyError(getErrorMessage(error))
        return Promise.reject(error)
      }
      if (!isLoggingOut) {
        isLoggingOut = true
        // LogOut 自身也会请求后端，失败也必须继续清理并刷新
        store.dispatch('LogOut').catch(() => {}).finally(() => {
          Cookies.set('point', 401)
          location.reload()
        })
      }
      return Promise.reject(error)
    }
    if (status === 403) {
      router.push({ path: '/401' })
      return Promise.reject(error)
    }

    notifyError(getErrorMessage(error))
    return Promise.reject(error)
  }
)
export default service

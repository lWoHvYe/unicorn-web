import axios from 'axios'
import router from '@/router/routers'
import { ElNotification } from 'element-plus'
import store from '../store'
import { getToken } from '@/utils/auth'
import Config from '@/settings'
import Cookies from 'js-cookie'

const notifyError = (title) => {
  ElNotification.error({
    title,
    duration: 5000
  })
}

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.PROD ? import.meta.env.VUE_APP_BASE_API : '/', // api 的 base_url
  timeout: Config.timeout // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (getToken()) {
      config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  error => {
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    const responseData = error.response && error.response.data
    // 兼容blob下载出错json提示
    if (responseData instanceof Blob && responseData.type.toLowerCase().indexOf('json') !== -1) {
      const reader = new FileReader()
      reader.readAsText(responseData, 'utf-8')
      reader.onload = function() {
        const errorMsg = JSON.parse(reader.result).message
        notifyError(errorMsg)
      }
    } else {
      let code = 0
      let errorMsg = ''
      try {
        // 兼容通用返回与原版返回
        code = responseData.status
        if (!code) {
          code = responseData.businessCode
        }
        if (!code) {
          code = error.response.status
        }
        errorMsg = responseData.message
        if (!errorMsg) {
          errorMsg = responseData.description
        }
        if (!errorMsg) {
          errorMsg = responseData
        }
      } catch (e) {
        if (error.toString().indexOf('Error: timeout') !== -1) {
          notifyError('网络请求超时')
          return Promise.reject(error)
        }
        if (!error.response) {
          notifyError('网络连接异常')
          return Promise.reject(error)
        }
      }
      console.log(code)
      if (code) {
        if (code === 401) {
          store.dispatch('LogOut').then(() => {
            // 用户登录界面提示
            Cookies.set('point', 401)
            location.reload()
          })
        } else if (code === 403) {
          router.push({ path: '/401' })
        } else {
          if (errorMsg !== undefined) {
            notifyError(String(errorMsg))
          }
        }
      } else {
        notifyError('接口请求失败')
      }
    }
    return Promise.reject(error)
  }
)
export default service

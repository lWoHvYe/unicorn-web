import request from '@/utils/request'

export function login(username, password, captchaVerification) {
  return request({
    url: 'auth/login',
    method: 'post',
    data: {
      username,
      password,
      captchaVerification
    }
  })
}

export function getInfo() {
  return request({
    url: 'auth/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: 'auth/logout',
    method: 'delete'
  })
}

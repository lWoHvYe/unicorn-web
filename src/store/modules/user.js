import { login, getInfo, logout } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    user: {},
    roles: [],
    // 第一次加载菜单时用到
    loadMenus: false
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_USER: (state, user) => {
      state.user = user
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_LOAD_MENUS: (state, loadMenus) => {
      state.loadMenus = loadMenus
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const rememberMe = userInfo.rememberMe
      return login(userInfo.username, userInfo.password, userInfo.captchaVerification).then(res => {
        if (!res || !res.id_token) {
          throw new Error('登录响应缺少 token')
        }
        setToken(res.id_token, rememberMe)
        commit('SET_TOKEN', res.id_token)
        setUserInfo(res.user, commit)
        // 第一次加载菜单时用到， 具体见 src 目录下的 permission.js
        commit('SET_LOAD_MENUS', true)
      })
    },

    // 获取用户信息
    GetInfo({ commit }) {
      return getInfo().then(res => {
        setUserInfo(res, commit)
        return res
      })
    },
    // 登出：即使后端接口失败，也必须在本地完成清理并 resolve，
    // 否则调用方的 location.reload() 永远不会执行。
    LogOut({ commit }) {
      return logout().catch(() => {}).finally(() => {
        logOut(commit)
      })
    },

    updateLoadMenus({ commit }) {
      commit('SET_LOAD_MENUS', false)
    }
  }
}

export const logOut = (commit) => {
  commit('SET_TOKEN', '')
  commit('SET_ROLES', [])
  commit('SET_USER', {})
  commit('SET_LOAD_MENUS', false)
  removeToken()
}

export const setUserInfo = (res, commit) => {
  const roles = res && Array.isArray(res.roles) ? res.roles : []
  // 如果没有任何权限，则赋予一个默认的权限，避免请求死循环
  if (roles.length === 0) {
    commit('SET_ROLES', ['ROLE_SYSTEM_DEFAULT'])
  } else {
    commit('SET_ROLES', roles)
  }
  commit('SET_USER', (res && res.user) || {})
}

export default user

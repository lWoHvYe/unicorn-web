import router from './routers'
import store from '@/store'
import Config from '@/settings'
import { ElNotification } from 'element-plus'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie
import { buildMenus } from '@/api/system/menu'
import { filterAsyncRouter } from '@/store/modules/permission'

NProgress.configure({ showSpinner: false })// NProgress Configuration

const whiteList = ['/login']// no redirect whitelist

router.beforeEach(async(to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + ' - ' + Config.title
  }
  NProgress.start()
  if (!getToken()) {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      // 用对象形式让 vue-router 负责 URL 编码，避免 query 中的 & 被拆开
      next({ path: '/login', query: { redirect: to.fullPath } })
      NProgress.done()
    }
    return
  }

  // 已登录且要跳转的页面是登录页
  if (to.path === '/login') {
    next({ path: '/' })
    NProgress.done()
    return
  }

  try {
    if (store.getters.roles.length === 0) { // 判断当前用户是否已拉取完user_info信息
      await store.dispatch('GetInfo')
      await loadMenus()
      // 加载成功后再清除标记；失败时保留，下一次导航可重试
      store.dispatch('updateLoadMenus')
      next({ ...to, replace: true })
      return
    }
    // 登录时未拉取菜单，在此处拉取
    if (store.getters.loadMenus) {
      await loadMenus()
      store.dispatch('updateLoadMenus')
      next({ ...to, replace: true })
      return
    }
    next()
  } catch (error) {
    NProgress.done()
    ElNotification.error({
      title: '页面初始化失败',
      message: store.getters.roles.length === 0 ? '用户信息加载失败，请重新登录' : '菜单加载失败，请稍后重试',
      duration: 5000
    })
    if (store.getters.roles.length === 0) {
      // 用户信息都拿不到，清理登录态后重新登录，避免停在半登录状态
      store.dispatch('LogOut').finally(() => {
        location.reload()
      })
    } else {
      next(false)
    }
  }
})

export const loadMenus = async() => {
  const res = await buildMenus()
  const content = (res && res.content) || []
  // filterAsyncRouter 会修改传入对象，因此准备两份
  const sdata = JSON.parse(JSON.stringify(content))
  const rdata = JSON.parse(JSON.stringify(content))
  const sidebarRoutes = filterAsyncRouter(sdata)
  const rewriteRoutes = filterAsyncRouter(rdata, false, true)

  await store.dispatch('GenerateRoutes', rewriteRoutes)
  // Vue Router 4 移除了 addRoutes，改为逐条 addRoute
  rewriteRoutes.forEach(route => router.addRoute(route))
  store.dispatch('SetSidebarRouters', sidebarRoutes)
  return rewriteRoutes
}

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

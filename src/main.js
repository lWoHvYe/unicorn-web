import { createApp } from 'vue'
import Cookies from 'js-cookie'

import 'normalize.css/normalize.css'
// Element Plus 基础变量与全局过渡样式；组件样式由 unplugin-vue-components 按需引入
import 'element-plus/theme-chalk/base.css'
import {
  ElMessage,
  ElMessageBox,
  ElNotification,
  provideGlobalConfig
} from 'element-plus'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import 'element-plus/es/components/notification/style/css'
import 'element-plus/es/components/loading/style/css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 数据字典
import dict from './components/Dict'

// 权限指令
import checkPer from '@/utils/permission'
import permission from './components/Permission'
import './assets/styles/index.scss'

import App from './App'
import store from './store'
import router from './router/routers'

import svgIcons from './assets/icons' // icon
import './router/index' // permission control

import { applyTheme } from './utils/theme'
import settings from './settings'

import { registerElementIcons } from './plugins/element-icons'
import highlight from './plugins/highlight'

const app = createApp(App)
const appSize = Cookies.get('size') || 'small'

// 替代 app.use(ElementPlus) 的全局配置，让 ElMessage/ElMessageBox 等
// 在组件外调用时仍使用中文 locale 和全局 size。
provideGlobalConfig({ locale: zhCn, size: appSize }, app, true)

// 兼容项目里 Options API 的 this.$message / this.$notify / this.$confirm
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$notify = ElNotification
app.config.globalProperties.$confirm = ElMessageBox.confirm
app.config.globalProperties.$msgbox = ElMessageBox
app.config.globalProperties.$alert = ElMessageBox.alert
app.config.globalProperties.$prompt = ElMessageBox.prompt

app.config.errorHandler = (err, instance, info) => {
  // 避免组件渲染异常导致白屏且无任何提示
  console.error('[Vue error]', err, info)
  ElNotification.error({
    title: '页面发生错误',
    message: (err && err.message) || '请刷新页面后重试',
    duration: 5000
  })
}

app.use(store)
app.use(router)
app.use(checkPer)
app.use(permission)
app.use(dict)
app.use(svgIcons)
app.use(highlight)
registerElementIcons(app)

applyTheme(Cookies.get('theme') || settings.theme)

app.mount('#app')

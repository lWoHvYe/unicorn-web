import { createApp } from 'vue'
import Cookies from 'js-cookie'

import 'normalize.css/normalize.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
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

app.use(store)
app.use(router)
app.use(ElementPlus, {
  // set element-plus default size
  size: Cookies.get('size') || 'small',
  locale: zhCn
})
app.use(checkPer)
app.use(permission)
app.use(dict)
app.use(svgIcons)
app.use(highlight)
registerElementIcons(app)

applyTheme(Cookies.get('theme') || settings.theme)

app.mount('#app')

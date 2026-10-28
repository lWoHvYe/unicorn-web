import * as ElementPlusIcons from '@element-plus/icons-vue'

// Element Plus 移除了 element-ui 的字体图标，这里把图标组件同时注册为
// `ElIconXxx` 形式与历史的 `el-icon-xxx` 形式，保证旧模板中的
// `icon="el-icon-plus"` / `prefix-icon="el-icon-search"` 等字符串仍然可用。
const toKebab = name => name
  .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
  .toLowerCase()

// element-ui 中少数图标名称与 Element Plus 的图标名不是简单的中划线转换关系
const legacyAliases = {
  'el-icon-s-grid': 'Grid',
  'el-icon-s-tools': 'Tools',
  'el-icon-s-promotion': 'Promotion'
}

export function registerElementIcons(app) {
  Object.keys(ElementPlusIcons).forEach(name => {
    const component = ElementPlusIcons[name]
    if (!component) {
      return
    }
    app.component(name, component)
    app.component(`el-icon-${toKebab(name)}`, component)
  })
  Object.keys(legacyAliases).forEach(alias => {
    const component = ElementPlusIcons[legacyAliases[alias]]
    if (component) {
      app.component(alias, component)
    }
  })
}

export default registerElementIcons

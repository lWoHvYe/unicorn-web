import SvgIcon from '@/components/SvgIcon'

// Vite 没有 require.context，用 import.meta.glob 读取所有 SVG 原始内容，
// 在运行时拼成一个 <symbol> 雪碧图注入 body（等价于原 svg-sprite-loader）。
const modules = import.meta.glob('./svg/*.svg', { query: '?raw', import: 'default', eager: true })

const iconNames = []
const symbols = []

Object.keys(modules).forEach(path => {
  const name = path.replace(/^.*\//, '').replace(/\.svg$/, '')
  const raw = String(modules[path] || '')
  const openTag = raw.match(/<svg\b[^>]*>/i)
  if (!openTag) {
    return
  }
  const attrs = openTag[0]
  let viewBox = (attrs.match(/viewBox="([^"]+)"/i) || [])[1]
  if (!viewBox) {
    const width = (attrs.match(/\bwidth="([\d.]+)"/i) || [])[1]
    const height = (attrs.match(/\bheight="([\d.]+)"/i) || [])[1]
    viewBox = `0 0 ${width || 1024} ${height || 1024}`
  }
  const inner = raw
    .slice((openTag.index || 0) + attrs.length)
    .replace(/<\/svg>\s*$/i, '')
  symbols.push(`<symbol id="icon-${name}" viewBox="${viewBox}">${inner}</symbol>`)
  iconNames.push(name)
})

iconNames.sort()

let injected = false

function injectSvgSprite() {
  if (injected || typeof document === 'undefined') {
    return
  }
  injected = true
  const container = document.createElement('div')
  container.id = 'svg-icon-sprite'
  container.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'
  container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${symbols.join('')}</svg>`
  document.body.insertBefore(container, document.body.firstChild)
}

export function registerSvgIcon(app) {
  injectSvgSprite()
  app.component('svg-icon', SvgIcon)
}

export { iconNames }

export default {
  install(app) {
    registerSvgIcon(app)
  }
}

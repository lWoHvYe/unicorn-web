/**
 * 浏览器环境下 path.resolve 的轻量实现。
 * 原项目直接 import Node 的 `path`，Vite 不再提供 Node polyfill。
 */
export function resolve(...parts) {
  let resolved = ''
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i]
    if (!part) {
      continue
    }
    resolved = String(part) + '/' + resolved
    if (String(part).startsWith('/')) {
      break
    }
  }
  const isAbsolute = resolved.startsWith('/')
  const segments = []
  resolved.split('/').forEach(segment => {
    if (!segment || segment === '.') {
      return
    }
    if (segment === '..') {
      segments.pop()
      return
    }
    segments.push(segment)
  })
  return (isAbsolute ? '/' : '') + segments.join('/')
}

export default { resolve }

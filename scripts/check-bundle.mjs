import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const root = process.cwd()
const distDir = join(root, 'dist')
const indexPath = join(distDir, 'index.html')

if (!existsSync(indexPath)) {
  console.error('[bundle] dist/index.html 不存在，请先执行 npm run build')
  process.exit(1)
}

const html = readFileSync(indexPath, 'utf8')
const assetPattern = /(?:src|href)="(?:\.\/)?(static\/[^"]+\.(?:js|css))"/g
const assets = [...new Set([...html.matchAll(assetPattern)].map(match => match[1]))]

if (assets.length === 0) {
  console.error('[bundle] 未从 dist/index.html 解析到任何静态资源')
  process.exit(1)
}

const forbidden = assets.filter(asset => /chunk-editor|chunk-echarts/.test(asset))
const files = assets.map(asset => join(distDir, asset))
const missing = files.filter(file => !existsSync(file))
if (missing.length > 0) {
  console.error('[bundle] index.html 引用了不存在的文件：', missing.join(', '))
  process.exit(1)
}

const rawBytes = files.reduce((total, file) => total + readFileSync(file).byteLength, 0)
const gzipBytes = files.reduce((total, file) => total + gzipSync(readFileSync(file), { level: 9 }).byteLength, 0)
const RAW_BUDGET = 3 * 1024 * 1024
const GZIP_BUDGET = 0.9 * 1024 * 1024

console.log(`[bundle] 首屏资源：${assets.length} 个，raw ${(rawBytes / 1024 / 1024).toFixed(2)}MB，gzip ${(gzipBytes / 1024 / 1024).toFixed(2)}MB`)
assets.forEach(asset => console.log(`  - ${asset}`))

let failed = false
if (forbidden.length > 0) {
  console.error(`[bundle] 首屏不应预加载编辑器/图表 chunk：${forbidden.join(', ')}`)
  failed = true
}
if (rawBytes > RAW_BUDGET) {
  console.error(`[bundle] 首屏 raw 体积超预算：${(rawBytes / 1024 / 1024).toFixed(2)}MB > ${RAW_BUDGET / 1024 / 1024}MB`)
  failed = true
}
if (gzipBytes > GZIP_BUDGET) {
  console.error(`[bundle] 首屏 gzip 体积超预算：${(gzipBytes / 1024 / 1024).toFixed(2)}MB > ${(GZIP_BUDGET / 1024 / 1024).toFixed(2)}MB`)
  failed = true
}

if (failed) {
  process.exit(1)
}
console.log('[bundle] 首屏预算检查通过')

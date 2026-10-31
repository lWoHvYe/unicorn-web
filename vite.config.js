import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
import { createRequire } from 'node:module'
import settings from './src/settings.js'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const crudDir = fileURLToPath(new URL('./src/components/Crud', import.meta.url))
const elementPlusVersion = createRequire(import.meta.url)('element-plus/package.json').version

function htmlTitle() {
  return {
    name: 'html-title',
    transformIndexHtml(html) {
      return html.replace(/%APP_TITLE%/g, settings.title)
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, '')
  const proxy = {}
  const prefixes = ['/api', '/auth', '/captcha', '/file', '/avatar']
  prefixes.forEach(prefix => {
    proxy[prefix] = {
      target: env.VUE_APP_BASE_API || 'https://localhost:8081',
      changeOrigin: true,
      secure: false
    }
  })

  return {
    base: mode === 'development' ? '/' : './',
    envPrefix: ['VITE_', 'VUE_APP_'],
    plugins: [
      vue(),
      htmlTitle(),
      Components({
        // 只处理 Element Plus 的模板组件与 v-loading 等指令，避免自动扫描
        // src/components 改变现有显式导入关系。
        dirs: [],
        dts: false,
        // 显式传入 Element Plus 版本，避免 resolver 版本探测失败时回退到
        // element-plus/lib/* 的旧路径（该路径不在 package exports 中）。
        resolvers: [ElementPlusResolver({ importStyle: 'css', version: elementPlusVersion })]
      })
    ],
    resolve: {
      // Vue CLI 默认支持省略 .vue 后缀，Vite 需要显式声明
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      alias: {
        '@': srcDir,
        '@crud': crudDir
      }
    },
    server: {
      port: 8013,
      open: false,
      proxy
    },
    preview: {
      port: 8013
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    },
    optimizeDeps: {
      include: [
        'element-plus',
        '@element-plus/icons-vue',
        'echarts',
        'echarts-gl',
        'echarts-wordcloud',
        'codemirror',
        'jsencrypt',
        'fuse.js',
        'md-editor-v3',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue',
        'cropperjs',
        'screenfull'
      ]
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      sourcemap: false,
      // 大 chunk 只在对应路由懒加载时下载；首屏预算由 scripts/check-bundle.mjs 校验，
      // 不再用 chunkSizeWarningLimit 掩盖首屏问题。
      chunkSizeWarningLimit: 3000
    },
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    }
  }
})

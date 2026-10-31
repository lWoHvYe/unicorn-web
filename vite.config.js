import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import settings from './src/settings.js'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const crudDir = fileURLToPath(new URL('./src/components/Crud', import.meta.url))

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
    plugins: [vue(), htmlTitle()],
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

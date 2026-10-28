<template>
  <div class="live2d-widget" aria-hidden="true" />
</template>

<script>
// 官方 CDN（中国大陆如访问不稳定，可通过 VITE_LIVE2D_BASE 覆盖）
const DEFAULT_BASES = [
  'https://fastly.jsdelivr.net/npm/live2d-widgets@0/',
  'https://unpkg.com/live2d-widgets@0/',
  'https://cdn.jsdelivr.net/npm/live2d-widgets@0/'
]
const DEFAULT_MODEL_CDN = 'https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/'
const TOOLS = ['hitokoto', 'asteroids', 'switch-model', 'switch-texture', 'photo', 'info', 'quit']

const normalizeBase = base => base.endsWith('/') ? base : `${base}/`

function loadStyle(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = () => resolve()
    link.onerror = () => reject(new Error(`Failed to load ${href}`))
    document.head.appendChild(link)
  })
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

export default {
  name: 'Live2DWidget',
  props: {
    model: {
      type: String,
      default: 'shizuku'
    },
    position: {
      type: String,
      default: 'right',
      validator: value => ['left', 'right'].includes(value)
    }
  },
  mounted() {
    this.initWidget()
  },
  methods: {
    async initWidget() {
      if (typeof window === 'undefined') {
        return
      }
      if (window.__live2d_loaded__) {
        this.applyPosition()
        return
      }
      if (window.__live2d_loading__) {
        return
      }
      window.__live2d_loading__ = true

      const configuredBase = import.meta.env.VITE_LIVE2D_BASE
      const bases = [...new Set([configuredBase, ...DEFAULT_BASES].filter(Boolean).map(normalizeBase))]
      const modelCdn = import.meta.env.VITE_LIVE2D_MODEL_CDN || DEFAULT_MODEL_CDN
      let lastError = null

      try {
        for (const base of bases) {
          try {
            await loadStyle(`${base}waifu.css`)
            await loadScript(`${base}live2d.min.js`)
            await loadScript(`${base}waifu-tips.js`)
            if (typeof window.initWidget !== 'function') {
              throw new Error('initWidget is not available')
            }
            if (document.getElementById('waifu')) {
              window.__live2d_loaded__ = true
              this.applyPosition()
              return
            }
            await this.selectModel(modelCdn)
            window.initWidget({
              waifuPath: `${base}waifu-tips.json`,
              cdnPath: modelCdn,
              tools: TOOLS
            })
            window.__live2d_loaded__ = true
            this.applyPosition()
            return
          } catch (error) {
            lastError = error
            console.warn(`[Live2D] 资源加载失败，尝试下一个 CDN：${base}`, error)
          }
        }
        console.error('[Live2D] 看板娘加载失败，请检查网络或配置 VITE_LIVE2D_BASE', lastError)
      } finally {
        window.__live2d_loading__ = false
      }
    },
    async selectModel(modelCdn) {
      // 若用户之前手动切换过模型，则尊重 localStorage；否则默认使用 shizuku
      if (localStorage.getItem('modelId') !== null) {
        return
      }
      try {
        const response = await fetch(`${modelCdn}model_list.json`)
        if (!response.ok) {
          return
        }
        const list = await response.json()
        const index = (list.models || []).findIndex(item => JSON.stringify(item).toLowerCase().includes(this.model.toLowerCase()))
        if (index >= 0) {
          localStorage.setItem('modelId', String(index))
          localStorage.setItem('modelTexturesId', '0')
        }
      } catch (error) {
        // 模型列表不可用时使用 live2d-widget 的默认模型
      }
    },
    applyPosition() {
      const styleId = 'live2d-widget-position'
      let style = document.getElementById(styleId)
      if (!style) {
        style = document.createElement('style')
        style.id = styleId
        document.head.appendChild(style)
      }
      const side = this.position === 'left'
        ? 'left: 0; right: auto;'
        : 'right: 0; left: auto;'
      style.textContent = `#waifu { ${side} }`
    }
  }
}
</script>

<style scoped>
.live2d-widget {
  display: none;
}
</style>

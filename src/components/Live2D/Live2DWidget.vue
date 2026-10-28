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

const LOAD_TIMEOUT = 10000

function loadStyle(href) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    const timer = setTimeout(() => reject(new Error(`Timeout loading ${href}`)), LOAD_TIMEOUT)
    link.onload = () => {
      clearTimeout(timer)
      resolve()
    }
    link.onerror = () => {
      clearTimeout(timer)
      reject(new Error(`Failed to load ${href}`))
    }
    document.head.appendChild(link)
  })
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    const timer = setTimeout(() => reject(new Error(`Timeout loading ${src}`)), LOAD_TIMEOUT)
    script.onload = () => {
      clearTimeout(timer)
      resolve()
    }
    script.onerror = () => {
      clearTimeout(timer)
      reject(new Error(`Failed to load ${src}`))
    }
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
      console.info('[Live2D] 组件已挂载，开始初始化')
      if (window.__live2d_loaded__) {
        console.info('[Live2D] 已加载，跳过重复初始化')
        this.applyPosition()
        return
      }
      if (window.__live2d_loading__) {
        console.info('[Live2D] 正在加载中，跳过')
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
            console.info(`[Live2D] 尝试加载资源：${base}`)
            await loadStyle(`${base}waifu.css`)
            await loadScript(`${base}live2d.min.js`)
            await loadScript(`${base}waifu-tips.js`)
            if (typeof window.initWidget !== 'function') {
              throw new Error('initWidget is not available')
            }
            if (document.getElementById('waifu')) {
              window.__live2d_loaded__ = true
              this.applyPosition()
              this.ensureVisible()
              return
            }
            await this.selectModel(modelCdn)
            console.info('[Live2D] 调用 initWidget')
            window.initWidget({
              waifuPath: `${base}waifu-tips.json`,
              cdnPath: modelCdn,
              tools: TOOLS
            })
            window.__live2d_loaded__ = true
            this.applyPosition()
            this.ensureVisible()
            console.info(`[Live2D] 看板娘加载完成：${base}`)
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
      // 清除"上次关闭"状态，避免 initWidget 只显示一个不显眼的召回按钮
      localStorage.removeItem('waifu-display')
      let list = null
      try {
        const response = await fetch(`${modelCdn}model_list.json`)
        if (response.ok) {
          list = await response.json()
        }
      } catch (error) {
        console.warn('[Live2D] 模型列表加载失败，使用默认模型', error)
      }
      if (!list || !Array.isArray(list.models)) {
        return
      }
      const current = localStorage.getItem('modelId')
      if (current !== null) {
        const index = Number(current)
        if (!Number.isInteger(index) || index < 0 || index >= list.models.length) {
          console.warn(`[Live2D] 本地模型索引 ${current} 无效，重置为默认模型`)
          localStorage.removeItem('modelId')
          localStorage.removeItem('modelTexturesId')
        }
      }
      if (localStorage.getItem('modelId') === null) {
        const index = list.models.findIndex(item => JSON.stringify(item).toLowerCase().includes(this.model.toLowerCase()))
        if (index >= 0) {
          localStorage.setItem('modelId', String(index))
          localStorage.setItem('modelTexturesId', '0')
        }
      }
      console.info(`[Live2D] 使用模型索引：${localStorage.getItem('modelId')}`)
    },
    ensureVisible() {
      const waifu = document.getElementById('waifu')
      if (waifu) {
        waifu.style.display = ''
        waifu.style.bottom = '0'
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

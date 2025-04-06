<template>
  <div :style="containerStyle" />
</template>

<script>
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
      validator: (val) => ['left', 'right'].includes(val)
    },
    width: {
      type: String,
      default: '150px'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  computed: {
    containerStyle() {
      return {
        position: 'fixed',
        bottom: '0',
        [this.position]: '0',
        width: this.width,
        height: this.height,
        zIndex: '9999',
        pointerEvents: 'none'
      }
    }
  },
  mounted() {
    if (!window.__live2d_loaded__) {
      const script = document.createElement('script')
      script.src = 'https://fastly.jsdelivr.net/npm/live2d-widgets@0/autoload.js'
      script.id = 'live2d-script'
      script.async = true
      document.body.appendChild(script)
      window.__live2d_loaded__ = true

      script.onload = () => {
        if (window.L2Dwidget) {
          window.L2Dwidget.init({
            model: {
              jsonPath: `https://fastly.jsdelivr.net/npm/live2d-widget-model-${this.model}@1/assets/${this.model}.model.json`
            },
            display: {
              position: this.position,
              width: parseInt(this.width),
              height: parseInt(this.height),
              hOffset: 0,
              vOffset: 0
            },
            mobile: {
              show: true
            },
            react: {
              opacityDefault: 1,
              opacityOnHover: 1
            }
          })
        }
      }
    }
  }
}
</script>

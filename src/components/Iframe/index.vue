<template>
  <div v-loading="loading" :style="'height:'+ height">
    <iframe :src="src" frameborder="no" style="width: 100%;height: 100%" scrolling="auto" />
  </div>
</template>
<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      height: document.documentElement.clientHeight - (84 + 22) + 'px',
      loading: true
    }
  },
  mounted: function() {
    setTimeout(() => {
      this.loading = false
    }, 230)
    this.__resizeHandler = () => {
      this.height = document.documentElement.clientHeight - (84 + 22) + 'px'
    }
    window.addEventListener('resize', this.__resizeHandler)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.__resizeHandler)
  }
}
</script>

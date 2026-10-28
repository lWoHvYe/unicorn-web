<template>
  <span>{{ displayValue }}</span>
</template>

<script>
export default {
  name: 'CountTo',
  props: {
    startVal: {
      type: Number,
      default: 0
    },
    endVal: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      default: 3000
    },
    decimals: {
      type: Number,
      default: 0
    },
    separator: {
      type: String,
      default: ','
    },
    prefix: {
      type: String,
      default: ''
    },
    suffix: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      displayValue: this.format(this.startVal),
      raf: null
    }
  },
  watch: {
    endVal() {
      this.start()
    }
  },
  mounted() {
    this.start()
  },
  beforeUnmount() {
    cancelAnimationFrame(this.raf)
  },
  methods: {
    start() {
      cancelAnimationFrame(this.raf)
      const from = this.startVal
      const to = this.endVal
      const startedAt = performance.now()
      const tick = now => {
        const progress = Math.min((now - startedAt) / this.duration, 1)
        this.displayValue = this.format(from + (to - from) * progress)
        if (progress < 1) {
          this.raf = requestAnimationFrame(tick)
        }
      }
      this.raf = requestAnimationFrame(tick)
    },
    format(value) {
      const fixed = Number(value).toFixed(this.decimals)
      const parts = fixed.split('.')
      const integer = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.separator)
      const decimal = parts[1] ? '.' + parts[1] : ''
      return this.prefix + integer + decimal + this.suffix
    }
  }
}
</script>

<template>
  <el-color-picker
    v-model="theme"
    :predefine="predefine"
    class="theme-picker"
    popper-class="theme-picker-dropdown"
  />
</template>

<script>
import Cookies from 'js-cookie'
import { applyTheme } from '@/utils/theme'

const ORIGINAL_THEME = '#1890ff' // default color
const STORAGE_KEY = 'theme'

export default {
  data() {
    return {
      theme: '',
      predefine: ['#409EFF', '#1890ff', '#304156', '#212121', '#11a983', '#13c2c2', '#6959CD', '#f5222d']
    }
  },
  computed: {
    defaultTheme() {
      return this.$store.state.settings.theme
    }
  },
  watch: {
    defaultTheme: {
      handler: function(val) {
        this.theme = val || ORIGINAL_THEME
      },
      immediate: true
    },
    theme(val) {
      if (typeof val !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(val)) {
        return
      }
      applyTheme(val)
      Cookies.set(STORAGE_KEY, val, { expires: 365 })
      this.$emit('change', val)
    }
  }
}
</script>

<style>
.theme-message,
.theme-picker-dropdown {
  z-index: 99999 !important;
}

.theme-picker .el-color-picker__trigger {
  height: 26px !important;
  width: 26px !important;
  padding: 2px;
}

.theme-picker-dropdown .el-color-dropdown__link-btn {
  display: none;
}
</style>

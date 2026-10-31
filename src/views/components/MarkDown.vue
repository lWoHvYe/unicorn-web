<template>
  <div class="app-container">
    <p class="warn-content">
      Markdown 基于
      <el-link type="primary" href="https://github.com/imzbf/md-editor-v3" target="_blank">md-editor-v3</el-link>
    </p>
    <md-editor v-model="text" :style="{ height }" :on-upload-img="onUploadImg" />
  </div>
</template>

<script>
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import { upload } from '@/utils/upload'
import { mapGetters } from 'vuex'

export default {
  name: 'Markdown',
  components: { MdEditor },
  data() {
    return {
      height: document.documentElement.clientHeight - 200 + 'px',
      text: '# Markdown\n\n请输入内容...'
    }
  },
  computed: {
    ...mapGetters([
      'imagesUploadApi',
      'baseApi'
    ])
  },
  mounted() {
    this.__resizeHandler = () => {
      this.height = document.documentElement.clientHeight - 200 + 'px'
    }
    window.addEventListener('resize', this.__resizeHandler)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.__resizeHandler)
  },
  methods: {
    async onUploadImg(files, callback) {
      const urls = []
      for (const file of files) {
        const data = await upload(this.imagesUploadApi, file)
        urls.push(this.baseApi + '/file/' + data.type + '/' + data.realName)
      }
      callback(urls)
    }
  }
}
</script>

<style scoped>
</style>

<template>
  <div class="app-container">
    <p class="warn-content">
      富文本基于
      <el-link type="primary" href="https://www.wangeditor.com/" target="_blank">wangEditor</el-link>
    </p>
    <el-row :gutter="10">
      <el-col :xs="24" :sm="24" :md="15" :lg="15" :xl="15">
        <rich-editor v-model="editorContent" height="420px" />
      </el-col>
      <el-col :xs="24" :sm="24" :md="9" :lg="9" :xl="9">
        <div v-html="editorContent" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import RichEditor from '@/components/RichEditor'

export default {
  name: 'Editor',
  components: { RichEditor },
  data() {
    return {
      editorContent: `
        <ul>
          <li>更多帮助请查看官方文档：<a style="color: #42b983" target="_blank" href="https://www.wangeditor.com/">wangEditor</a></li>
        </ul>
        `
    }
  }
}
</script>

<style scoped>
.text {
  text-align: left;
}
</style>

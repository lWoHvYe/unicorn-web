<template>
  <div class="rich-editor">
    <Toolbar
      :editor="editorRef"
      :default-config="toolbarConfig"
      mode="default"
      class="rich-editor__toolbar"
    />
    <Editor
      v-model="valueHtml"
      :default-config="editorConfig"
      mode="default"
      :style="{ height, overflowY: 'hidden' }"
      @onCreated="handleCreated"
    />
  </div>
</template>

<script>
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import store from '@/store'
import { upload } from '@/utils/upload'

export default {
  name: 'RichEditor',
  components: { Editor, Toolbar },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    height: {
      type: String,
      default: '420px'
    },
    placeholder: {
      type: String,
      default: '请输入内容...'
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const editorRef = shallowRef()
    const valueHtml = ref(props.modelValue || '')
    const toolbarConfig = {}
    const editorConfig = {
      placeholder: props.placeholder,
      MENU_CONF: {
        uploadImage: {
          async customUpload(file, insertFn) {
            try {
              const res = await upload(store.getters.imagesUploadApi, file)
              const data = res.data
              const url = store.getters.baseApi + '/file/' + data.type + '/' + data.realName
              insertFn(url, data.name || '', url)
            } catch (e) {
              // 上传失败时由 axios 拦截器统一提示
            }
          }
        }
      }
    }

    watch(() => props.modelValue, val => {
      if (val !== valueHtml.value) {
        valueHtml.value = val || ''
      }
    })
    watch(valueHtml, val => {
      emit('update:modelValue', val)
      emit('change', val)
    })

    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor) {
        editor.destroy()
      }
    })

    return {
      editorRef,
      valueHtml,
      toolbarConfig,
      editorConfig,
      handleCreated: editor => {
        editorRef.value = editor
      }
    }
  }
}
</script>

<style scoped>
.rich-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  text-align: left;
}

.rich-editor__toolbar {
  border-bottom: 1px solid #dcdfe6;
}
</style>

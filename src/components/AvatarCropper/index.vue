<template>
  <el-dialog v-model="visible" title="上传头像" width="600px" append-to-body @closed="reset">
    <div class="avatar-cropper">
      <div v-if="!imageUrl" class="avatar-cropper__picker">
        <el-button type="primary" @click="chooseFile">选择图片</el-button>
        <p class="avatar-cropper__tip">支持 JPG / PNG，建议上传正方形图片</p>
      </div>
      <div v-else class="avatar-cropper__wrapper">
        <img ref="image" :src="imageUrl" alt="avatar">
      </div>
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange">
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="uploading" :disabled="!imageUrl" @click="confirm">上传</el-button>
    </template>
  </el-dialog>
</template>

<script>
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import axios from 'axios'

export default {
  name: 'AvatarCropper',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      required: true
    },
    headers: {
      type: Object,
      default: () => ({})
    },
    field: {
      type: String,
      default: 'avatar'
    }
  },
  emits: ['update:modelValue', 'crop-upload-success'],
  data() {
    return {
      imageUrl: '',
      uploading: false,
      cropper: null
    }
  },
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      }
    }
  },
  methods: {
    chooseFile() {
      this.$refs.fileInput.click()
    },
    onFileChange(event) {
      const file = event.target.files && event.target.files[0]
      if (!file) {
        return
      }
      if (!/^image\//.test(file.type)) {
        this.$message.error('请选择图片文件')
        return
      }
      if (this.imageUrl) {
        URL.revokeObjectURL(this.imageUrl)
      }
      this.imageUrl = URL.createObjectURL(file)
      this.$nextTick(() => this.initCropper())
    },
    initCropper() {
      if (this.cropper) {
        this.cropper.destroy()
        this.cropper = null
      }
      this.cropper = new Cropper(this.$refs.image, {
        aspectRatio: 1,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        responsive: true,
        background: false
      })
    },
    confirm() {
      if (!this.cropper) {
        return
      }
      const canvas = this.cropper.getCroppedCanvas({
        width: 300,
        height: 300,
        imageSmoothingQuality: 'high'
      })
      canvas.toBlob(blob => {
        if (!blob) {
          return
        }
        this.upload(blob)
      }, 'image/png')
    },
    upload(blob) {
      const data = new FormData()
      data.append(this.field, blob, 'avatar.png')
      this.uploading = true
      axios.post(this.url, data, { headers: this.headers }).then(res => {
        this.$emit('crop-upload-success', res.data, this.field)
        this.$message.success('头像更新成功')
        this.visible = false
      }).catch(() => {
        this.$message.error('头像上传失败')
      }).finally(() => {
        this.uploading = false
      })
    },
    reset() {
      if (this.cropper) {
        this.cropper.destroy()
        this.cropper = null
      }
      if (this.imageUrl) {
        URL.revokeObjectURL(this.imageUrl)
        this.imageUrl = ''
      }
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    }
  }
}
</script>

<style scoped>
.avatar-cropper {
  min-height: 240px;
  text-align: center;
}

.avatar-cropper__picker {
  padding: 60px 0;
}

.avatar-cropper__tip {
  margin-top: 12px;
  color: #909399;
  font-size: 13px;
}

.avatar-cropper__wrapper {
  max-height: 420px;
  overflow: hidden;
}

.avatar-cropper__wrapper img {
  max-width: 100%;
  display: block;
  margin: 0 auto;
}
</style>

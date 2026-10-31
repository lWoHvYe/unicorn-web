<template>
  <div>
    <input ref="excel-upload-input" class="excel-upload-input" type="file" accept=".xlsx" @change="handleClick">
    <div class="drop" @drop="handleDrop" @dragover="handleDragover" @dragenter="handleDragover">
      拖拽excel文件到此处 或者
      <el-button :loading="loading" style="margin-left:16px;" size="small" type="primary" @click="handleUpload">
        浏览
      </el-button>
    </div>
  </div>
</template>

<script>
import readXlsxFile from 'read-excel-file/browser'

export default {
  props: {
    beforeUpload: Function,
    onSuccess: Function
  },
  data() {
    return {
      loading: false,
      excelData: {
        header: null,
        results: null
      }
    }
  },
  methods: {
    generateData({ header, results }) {
      this.excelData.header = header
      this.excelData.results = results
      this.onSuccess && this.onSuccess(this.excelData)
    },
    handleDrop(e) {
      e.stopPropagation()
      e.preventDefault()
      if (this.loading) return
      const files = e.dataTransfer.files
      if (files.length !== 1) {
        this.$message.error('只支持单个文件上传!')
        return
      }
      const rawFile = files[0]

      if (!this.isExcel(rawFile)) {
        this.$message.error('只支持 .xlsx 格式文件')
        return false
      }
      this.upload(rawFile)
      e.stopPropagation()
      e.preventDefault()
    },
    handleDragover(e) {
      e.stopPropagation()
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    },
    handleUpload() {
      this.$refs['excel-upload-input'].click()
    },
    handleClick(e) {
      const files = e.target.files
      const rawFile = files[0] // only use files[0]
      if (!rawFile) return
      this.upload(rawFile)
    },
    upload(rawFile) {
      this.$refs['excel-upload-input'].value = null // fix can't select the same excel

      if (!this.beforeUpload) {
        this.readerData(rawFile)
        return
      }
      const before = this.beforeUpload(rawFile)
      if (before) {
        this.readerData(rawFile)
      }
    },
    async readerData(rawFile) {
      this.loading = true
      try {
        const rows = await readXlsxFile(rawFile)
        const headerRow = rows[0] || []
        const header = headerRow.map((value, index) => {
          return this.getCellText(value) || `UNKNOWN ${index}`
        })
        const results = rows.slice(1).map(row => {
          const item = {}
          header.forEach((key, index) => {
            item[key] = this.getCellText(row[index])
          })
          return item
        })
        this.generateData({ header, results })
      } catch (e) {
        this.$message.error('Excel 解析失败：' + (e.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    getCellText(value) {
      if (value === null || value === undefined) {
        return ''
      }
      if (value instanceof Date) {
        return value.toISOString()
      }
      return String(value)
    },
    isExcel(file) {
      return /\.xlsx$/.test(file.name)
    }
  }
}
</script>

<style scoped>
.excel-upload-input{
  display: none;
  z-index: -9999;
}
.drop{
  border: 2px dashed #bbb;
  width: 600px;
  height: 160px;
  line-height: 160px;
  margin: 0 auto;
  font-size: 24px;
  border-radius: 5px;
  text-align: center;
  color: #bbb;
  position: relative;
}
</style>

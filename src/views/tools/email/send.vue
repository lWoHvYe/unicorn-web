<template>
  <div>
    <el-form ref="form" :model="form" :rules="rules" style="margin-top: 6px;" size="small" label-width="100px">
      <el-form-item label="邮件标题" prop="subject">
        <el-input v-model="form.subject" style="width: 646px" />
      </el-form-item>
      <el-form-item
        v-for="(domain, index) in tos"
        :key="domain.key"
        :label="'收件邮箱' + (index === 0 ? '': index)"
      >
        <el-input v-model="domain.value" style="width: 550px" />
        <el-button icon="el-icon-plus" @click="addDomain" />
        <el-button style="margin-left:0;" icon="el-icon-minus" @click.prevent="removeDomain(domain)" />
      </el-form-item>
      <div class="editor">
        <rich-editor v-model="form.content" height="360px" />
      </div>
      <el-button :loading="loading" style="margin-left:1.6%;" size="default" type="primary" @click="doSubmit">发送邮件</el-button>
    </el-form>
  </div>
</template>

<script>
import { send } from '@/api/tools/email'
import { validEmail } from '@/utils/validate'
import RichEditor from '@/components/RichEditor'

export default {
  name: 'Index',
  components: { RichEditor },
  data() {
    return {
      loading: false,
      form: { subject: '', tos: [], content: '' },
      tos: [{
        value: ''
      }],
      rules: {
        subject: [
          { required: true, message: '标题不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    removeDomain(item) {
      const index = this.tos.indexOf(item)
      if (index !== -1 && this.tos.length !== 1) {
        this.tos.splice(index, 1)
      } else {
        this.$message({
          message: '请至少保留一位联系人',
          type: 'warning'
        })
      }
    },
    addDomain() {
      this.tos.push({
        value: '',
        key: Date.now()
      })
    },
    doSubmit() {
      const _this = this
      this.$refs['form'].validate((valid) => {
        this.form.tos = []
        if (valid) {
          let sub = false
          this.tos.forEach(function(data) {
            if (data.value === '') {
              _this.$message({
                message: '收件邮箱不能为空',
                type: 'warning'
              })
              sub = true
            } else if (validEmail(data.value)) {
              _this.form.tos.push(data.value)
            } else {
              _this.$message({
                message: '收件邮箱格式错误',
                type: 'warning'
              })
              sub = true
            }
          })
          if (sub) { return false }
          this.loading = true
          send(this.form).then(() => {
            this.$notify({
              title: '发送成功',
              type: 'success',
              duration: 2500
            })
            this.loading = false
          }).catch(err => {
            this.loading = false
            console.log(err.response && err.response.data && err.response.data.description)
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
.editor {
  text-align: left;
  margin: 20px;
  width: 730px;
}
</style>

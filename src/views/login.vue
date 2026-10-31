<template>
  <div class="login" :style="'background-image:url('+ Background +');'">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-position="left" label-width="0px" class="login-form">
      <h3 class="title">
        EL-ADMIN 后台管理系统
      </h3>
      <el-form-item prop="username">
        <!--   v-model是View和Model间的双向绑定，v-text,v-html,v-bind都是单向绑定     -->
        <el-input v-model="loginForm.username" type="text" autocomplete="username" placeholder="账号">
          <template #prefix><svg-icon  icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" autocomplete="current-password" placeholder="密码" @keyup.enter="handleLogin">
          <template #prefix><svg-icon  icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-checkbox v-model="loginForm.rememberMe" style="margin:0 0 25px 0;">
        记住我
      </el-checkbox>
      <el-form-item style="width:100%;">
        <el-button :loading="loading" size="default" type="primary" style="width:100%;" @click.prevent="handleLogin">
          <span v-if="!loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div v-if="$store.state.settings.showFooter" id="el-login-footer">
      <span v-html="$store.state.settings.footerTxt" />
      <span> ⋅ </span>
      <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">{{ $store.state.settings.caseNumber }}</a>
    </div>
    <!--  :mode是 v-bind:mode的缩写，@verifySuccess是v-on:verifySuccess的缩写  -->
    <Verify
      ref="verify"
      :mode="'pop'"
      :captcha-type="'blockPuzzle'"
      :img-size="{ width: '330px', height: '155px' }"
      @verifySuccess="verifySuccess"
    />
  </div>
</template>

<script>
import { encrypt } from '@/utils/rsaEncrypt'
import Config from '@/settings'
import Cookies from 'js-cookie'
import Background from '@/assets/images/background.jpg'
import Verify from '@/views/components/verifition/Verify'

export default {
  name: 'Login',
  components: { Verify },
  data() {
    return {
      Background: Background,
      loginForm: {
        username: '',
        password: '',
        rememberMe: false,
        captchaVerification: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '用户名不能为空' }],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }]
      },
      loading: false,
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const redirect = route.query && route.query.redirect
        // 只接受站内绝对路径，避免把 redirect 当成外部地址
        this.redirect = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
          ? redirect
          : undefined
      },
      immediate: true
    }
  },
  created() {
    // 获取用户名密码等Cookie
    this.getCookie()
    // token 过期提示
    this.point()
  },
  methods: {
    verifySuccess(params) {
      // params 返回的二次验证参数, 和登录参数一起回传给登录接口，方便后台进行二次验证
      this.loginForm.captchaVerification = params.captchaVerification
    },
    getCookie() {
      const username = Cookies.get('username')
      const rememberMe = Cookies.get('rememberMe')
      this.loginForm.username = username === undefined ? '' : username
      // Cookie 中只保存用户名和“记住我”标记，不再持久化密码密文
      this.loginForm.rememberMe = rememberMe === 'true'
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) {
          return false
        }
        const password = encrypt(this.loginForm.password)
        if (!password) {
          this.$message.error('密码加密失败，请重试')
          return false
        }
        const user = {
          username: this.loginForm.username,
          password,
          rememberMe: this.loginForm.rememberMe,
          captchaVerification: this.loginForm.captchaVerification
        }
        this.loading = true
        if (user.rememberMe) {
          Cookies.set('username', user.username, { expires: Config.passCookieExpires })
          Cookies.set('rememberMe', 'true', { expires: Config.passCookieExpires })
        } else {
          Cookies.remove('username')
          Cookies.remove('rememberMe')
        }
        this.$store.dispatch('Login', user).then(() => {
          this.loading = false
          const redirect = this.redirect && this.redirect.startsWith('/') && !this.redirect.startsWith('//')
            ? this.redirect
            : '/'
          // 使用字符串形式，保留 redirect 中的 query/hash
          this.$router.push(redirect)
        }).catch(error => {
          this.loading = false
          this.loginForm.captchaVerification = ''
          if (this.$refs.verify && this.$refs.verify.refresh) {
            this.$refs.verify.refresh()
          }
          // 后端要求二次验证时，自动打开验证码，避免功能不可达
          const data = error && error.response && error.response.data
          const message = data && (data.message || data.description)
          if (/验证|captcha/i.test(String(message || '')) && this.$refs.verify) {
            this.$refs.verify.show()
          }
        })
      })
    },
    point() {
      const point = Cookies.get('point') !== undefined
      if (point) {
        this.$notify({
          title: '提示',
          message: '当前登录状态已过期，请重新登录！',
          type: 'warning',
          duration: 5000
        })
        Cookies.remove('point')
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-size: cover;
}

.title {
  margin: 0 auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 385px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 38px;

    input {
      height: 38px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  display: inline-block;
  height: 38px;
  float: right;

  img {
    cursor: pointer;
    vertical-align: middle
  }
}
</style>

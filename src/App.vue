<template>
  <el-config-provider :locale="locale" :size="size">
    <router-view />
  </el-config-provider>
</template>

<script>
import { mapGetters } from 'vuex'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

export default {
  name: 'App',
  data() {
    return {
      locale: zhCn
    }
  },
  computed: {
    ...mapGetters(['size'])
  }
}
</script>

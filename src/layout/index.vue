<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div :class="{hasTagsView:needTagsView}" class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel v-if="showSettings">
        <settings />
      </right-panel>
    </div>
  </div>
</template>

<script>
import RightPanel from '@/components/RightPanel'
import { AppMain, Navbar, Settings, Sidebar, TagsView } from './components'
import ResizeMixin from './mixin/ResizeHandler'
import { mapState } from 'vuex'
export default {
  name: 'Layout',
  components: {
    AppMain,
    Navbar,
    RightPanel,
    Settings,
    Sidebar,
    TagsView
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      showSettings: state => state.settings.showSettings,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  mounted() {
    // 初始化后即建立连接
    this.initWebSocket()
  },
  beforeUnmount() {
    if (this.websock) {
      this.websock.onerror = null
      this.websock.onmessage = null
      this.websock.close()
      this.websock = null
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    },
    // 4 webSocket
    initWebSocket() {
      const wsBase = import.meta.env.VUE_APP_WS_API
      if (!wsBase) {
        return
      }
      try {
        this.websock = new WebSocket(wsBase.replace(/\/$/, '') + '/webSocket/sysMember')
      } catch (e) {
        return
      }
      this.websock.onerror = this.webSocketOnError
      this.websock.onmessage = this.webSocketOnMessage
    },
    webSocketOnError() {
      this.$notify({
        title: 'WebSocket连接发生错误',
        type: 'error',
        duration: 5000
      })
    },
    webSocketOnMessage(e) {
      let data
      try {
        data = JSON.parse(e.data)
      } catch (error) {
        return
      }
      // 不使用 dangerouslyUseHTMLString，后端消息按纯文本渲染，避免 XSS
      if (data.msgType === 'INFO') {
        this.$notify({
          title: '系统通知 🦄️',
          message: String(data.msg || ''),
          type: 'success',
          duration: 5500
        })
      } else if (data.msgType === 'ERROR') {
        this.$notify({
          title: '系统通知 ❌',
          message: String(data.msg || ''),
          type: 'error',
          duration: 5000
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @use "../assets/styles/mixin.scss" as *;
  @use "../assets/styles/variables.scss" as *;

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
    padding: 0;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .mobile .fixed-header {
    width: 100%;
  }
</style>

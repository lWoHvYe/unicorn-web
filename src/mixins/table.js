import { download, initData } from '@/api/data'
import { downloadFile } from '@/utils/index'

/**
 * 轻量列表/分页 mixin。
 *
 * 历史 `src/mixins/crud.js` 同时包含列表、表单、增删改和弹窗逻辑，但实际只有
 * 4 个页面使用，并且这些页面只用到列表查询/分页/导出。这里保留最小 API，
 * 新页面请优先使用 `@crud/crud`。
 */
export default {
  data() {
    return {
      // 表格数据
      data: [],
      // 排序规则；可以是数组或后端字符串
      sort: ['id,desc'],
      // 后端页码从 0 开始；UI 使用 page + 1
      page: 0,
      size: 10,
      total: 0,
      url: '',
      title: '',
      query: {},
      params: {},
      loading: false,
      downloadLoading: false
    }
  },
  methods: {
    downloadFile,
    /**
     * 加载列表。beforeInit 可修改 url/params/sort，返回 false 时跳过请求。
     * 请求错误由 request 拦截器统一提示，这里只负责结束 loading。
     */
    async init() {
      if (!(await this.beforeInit())) {
        return
      }
      this.loading = true
      try {
        const data = await initData(this.url, this.getQueryParams())
        this.total = data.totalElements
        this.data = data.content
        return data
      } catch (e) {
        return undefined
      } finally {
        this.loading = false
      }
    },
    beforeInit() {
      return true
    },
    getQueryParams() {
      return {
        page: this.page,
        size: this.size,
        sort: this.sort,
        ...this.query,
        ...this.params
      }
    },
    // 页码从 1 开始（Element Plus pagination）
    pageChange(e) {
      this.page = e - 1
      return this.init()
    },
    sizeChange(e) {
      this.page = 0
      this.size = e
      return this.init()
    },
    // 删除最后一条/当前页数据后预防页码越界
    dleChangePage(size = 1) {
      if (this.data.length === size && this.page !== 0) {
        this.page -= 1
      }
    },
    toQuery() {
      this.page = 0
      return this.init()
    },
    notify(title, type = 'success') {
      this.$notify({
        title,
        type,
        duration: 2500
      })
    },
    editSuccessNotify() {
      this.notify('编辑成功', 'success')
    },
    /**
     * 导出当前筛选条件；不传 page/size，让后端导出全部匹配数据。
     */
    async downloadMethod() {
      this.downloadLoading = true
      try {
        const { page, size, ...params } = this.getQueryParams()
        const result = await download(this.url + '/download', params)
        downloadFile(result, this.title + '数据', 'xlsx')
      } finally {
        this.downloadLoading = false
      }
    }
  }
}

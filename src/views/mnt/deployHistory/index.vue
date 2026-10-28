<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.blurry" clearable placeholder="输入搜索内容" style="width: 200px" class="filter-item" @keyup.enter="crud.toQuery" />
        <date-range-picker v-model="query.deployDate" class="date-item" />
        <rrOperation />
      </div>
      <crudOperation :permission="permission" />
    </div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="appName" label="应用名称" />
      <el-table-column prop="ip" label="部署IP" />
      <el-table-column prop="deployUser" label="部署人员" />
      <el-table-column prop="deployDate" label="部署时间" />
      <el-table-column v-if="checkPer(['admin','deployHistory:del'])" label="操作" width="100px" align="center">
        <template #default="scope">
          <el-popover
            :ref="'popover-' + scope.row.id"
            v-permission="['admin','deployHistory:del']"
            placement="top"
            width="180"
          >
            <p>确定删除本条数据吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="small" link type="primary" @click="$refs['popover-' + scope.row.id].hide()">取消</el-button>
              <el-button :loading="delLoading" type="primary" size="small" @click="delMethod(scope.row.id)">确定</el-button>
            </div>
            <template #reference><el-button  type="danger" icon="el-icon-delete" size="small" /></template>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>
import { del } from '@/api/mnt/deployHistory'
import CRUD, { presenter, header } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'

export default {
  name: 'DeployHistory',
  components: { pagination, crudOperation, rrOperation, DateRangePicker },
  cruds() {
    return CRUD({ title: '部署历史', url: 'api/deployHistory', crudMethod: { del }})
  },
  mixins: [presenter(), header()],
  data() {
    return {
      delLoading: false,
      permission: {
        del: ['admin', 'deployHistory:del']
      }
    }
  },
  created() {
    this.crud.optShow = {
      add: false,
      edit: false,
      del: true,
      download: true
    }
  },
  methods: {
    delMethod(id) {
      this.delLoading = true
      del([id]).then(() => {
        this.delLoading = false
        const popover = this.$refs['popover-' + id]
        if (popover) {
          popover.hide()
        }
        this.crud.dleChangePage(1)
        this.crud.delSuccessNotify()
        this.crud.toQuery()
      }).catch(() => {
        this.delLoading = false
        const popover = this.$refs['popover-' + id]
        if (popover) {
          popover.hide()
        }
      })
    }
  }
}
</script>

<style scoped>
</style>

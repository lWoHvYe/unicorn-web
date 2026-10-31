<template>
  <div class="crud-opts">
    <span class="crud-opts-left">
      <!--左侧插槽-->
      <slot name="left" />
      <el-button
        v-if="crud.optShow.add"
        class="filter-item"
        size="small"
        type="primary"
        icon="el-icon-plus"
        @click="crud.toAdd"
      >
        新增
      </el-button>
      <el-button
        v-if="crud.optShow.edit"
        class="filter-item"
        size="small"
        type="success"
        icon="el-icon-edit"
        :disabled="crud.selections.length !== 1"
        @click="crud.toEdit(crud.selections[0])"
      >
        修改
      </el-button>
      <el-button
        v-if="crud.optShow.del"
        class="filter-item"
        type="danger"
        icon="el-icon-delete"
        size="small"
        :loading="crud.delAllLoading"
        :disabled="crud.selections.length === 0"
        @click="toDelete(crud.selections)"
      >
        删除
      </el-button>
      <el-button
        v-if="crud.optShow.download"
        :loading="crud.downloadLoading"
        :disabled="!crud.data.length"
        class="filter-item"
        size="small"
        type="warning"
        icon="el-icon-download"
        @click="crud.doExport"
      >导出</el-button>
      <!--右侧-->
      <slot name="right" />
    </span>
    <el-button-group class="crud-opts-right">
      <el-button
        size="small"
        plain
        type="info"
        icon="el-icon-search"
        @click="toggleSearch()"
      />
      <el-button
        size="small"
        icon="el-icon-refresh"
        @click="crud.refresh()"
      />
      <el-popover
        placement="bottom-end"
        width="150"
        trigger="click"
      >
        <template #reference>
          <el-button size="small" icon="el-icon-s-grid">
            <i class="fa fa-caret-down" aria-hidden="true" />
          </el-button>
        </template>
        <el-checkbox
          v-model="allColumnsSelected"
          :indeterminate="allColumnsSelectedIndeterminate"
          @change="handleCheckAllChange"
        >
          全选
        </el-checkbox>
        <el-checkbox
          v-for="item in tableColumns"
          :key="item.property"
          v-model="item.visible"
          @change="handleCheckedTableColumnsChange(item)"
        >
          {{ item.label }}
        </el-checkbox>
      </el-popover>
    </el-button-group>
  </div>
</template>
<script>
import CRUD, { crud } from '@crud/crud'

const noop = () => {}

export default {
  mixins: [crud()],
  props: {
    permission: {
      type: Object,
      default: () => { return {} }
    },
    hiddenColumns: {
      type: Array,
      default: () => { return [] }
    },
    ignoreColumns: {
      type: Array,
      default: () => { return [] }
    }
  },
  data() {
    return {
      tableColumns: [],
      allColumnsSelected: true,
      allColumnsSelectedIndeterminate: false
    }
  },
  watch: {
    'crud.props.table'() {
      // 切换表格时清空缓存的列配置
      this.columnConfigs = {}
      this.updateTableColumns()
      this.tableColumns.forEach(column => {
        if (this.hiddenColumns.indexOf(column.property) !== -1 && column.visible) {
          column.visible = false
          this.updateColumnVisible(column)
        }
      })
    }
  },
  created() {
    // 不放进 data，避免 Element Plus 的列配置被 Vue 3 响应式代理
    this.columnConfigs = {}
    this.crud.updateProp('searchToggle', true)
  },
  methods: {
    getTableStates() {
      const table = this.crud.getTable()
      return table && table.store ? table.store.states : null
    },
    getColumns(states) {
      const raw = states._columns
      return (raw && 'value' in raw ? raw.value : raw) || []
    },
    columnFilter(column) {
      return column && column.type === 'default' && column.property && this.ignoreColumns.indexOf(column.property) === -1
    },
    updateTableColumns() {
      const states = this.getTableStates()
      if (!states) {
        this.tableColumns = []
        return
      }
      const columns = this.getColumns(states)
      columns.filter(column => this.columnFilter(column)).forEach(column => {
        this.columnConfigs[column.property] = column
      })
      const ordered = Object.keys(this.columnConfigs)
        .map(property => this.columnConfigs[property])
        .filter(column => this.columnFilter(column))
        .sort((a, b) => {
          const indexA = a.getColumnIndex ? a.getColumnIndex() : 0
          const indexB = b.getColumnIndex ? b.getColumnIndex() : 0
          return indexA - indexB
        })
      const visibleProperties = columns.filter(column => this.columnFilter(column)).map(column => column.property)
      this.tableColumns = ordered.map(column => ({
        property: column.property,
        label: column.label,
        visible: visibleProperties.indexOf(column.property) !== -1
      }))
      this.refreshCheckState()
    },
    refreshCheckState() {
      const totalCount = this.tableColumns.length
      const selectedCount = this.tableColumns.filter(column => column.visible).length
      this.allColumnsSelected = totalCount > 0 && selectedCount === totalCount
      this.allColumnsSelectedIndeterminate = selectedCount !== 0 && selectedCount !== totalCount
    },
    toDelete(datas) {
      this.$confirm(`确认删除选中的${datas.length}条数据?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.crud.delAllLoading = true
        this.crud.doDelete(datas)
      }).catch(() => {
      })
    },
    handleCheckAllChange(val) {
      if (val === false) {
        // 至少保留一列可见，避免 Element Plus 表格没有任何列
        const visibleColumns = this.tableColumns.filter(column => column.visible)
        if (visibleColumns.length <= 1) {
          this.allColumnsSelected = true
          this.allColumnsSelectedIndeterminate = false
          this.crud.notify('请至少选择一列', CRUD.NOTIFICATION_TYPE.WARNING)
          return
        }
        visibleColumns.slice(1).forEach(column => {
          column.visible = false
          this.updateColumnVisible(column)
        })
        this.refreshCheckState()
        return
      }
      this.tableColumns.forEach(column => {
        if (!column.visible) {
          column.visible = true
          this.updateColumnVisible(column)
        }
      })
      this.allColumnsSelected = val
      this.allColumnsSelectedIndeterminate = false
    },
    handleCheckedTableColumnsChange(item) {
      let totalCount = 0
      let selectedCount = 0
      this.tableColumns.forEach(column => {
        ++totalCount
        selectedCount += column.visible ? 1 : 0
      })
      if (selectedCount === 0) {
        this.crud.notify('请至少选择一列', CRUD.NOTIFICATION_TYPE.WARNING)
        this.$nextTick(() => {
          item.visible = true
          this.refreshCheckState()
        })
        return
      }
      this.allColumnsSelected = selectedCount === totalCount
      this.allColumnsSelectedIndeterminate = selectedCount !== totalCount && selectedCount !== 0
      this.updateColumnVisible(item)
    },
    updateColumnVisible(item) {
      const table = this.crud.getTable()
      const states = this.getTableStates()
      if (!table || !states) {
        return
      }
      const config = this.columnConfigs[item.property]
      if (!config) {
        return
      }
      const columns = this.getColumns(states)
      const visible = columns.some(column => column.property === item.property)
      if (item.visible && !visible) {
        table.store.commit('insertColumn', config, null, noop)
      } else if (!item.visible && visible) {
        table.store.commit('removeColumn', config, null, noop)
      }
      this.updateTableColumns()
    },
    toggleSearch() {
      this.crud.props.searchToggle = !this.crud.props.searchToggle
    }
  }
}
</script>

<style>
  .crud-opts {
    padding: 4px 0;
    display: -webkit-flex;
    display: flex;
    align-items: center;
  }
  .crud-opts .crud-opts-right {
    margin-left: auto;
  }
  .crud-opts .crud-opts-right span {
    float: left;
  }
</style>

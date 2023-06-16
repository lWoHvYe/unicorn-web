<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">ID</label>
        <el-input v-model="query.resourceId" clearable placeholder="ID" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="ID">
            <el-input v-model="form.resourceId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="资源名称">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="URI" prop="pattern">
            <el-input v-model="form.pattern" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio
                v-for="item in dict.status"
                :key="item.id"
                :label="item.value"
              >{{ item.label }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="所在类名">
            <el-input v-model="form.restName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="请求方法">
            <el-input v-model="form.reqMethod" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="resourceId" label="ID" />
        <el-table-column prop="name" label="资源名称" />
        <el-table-column prop="pattern" label="URI" />
        <el-table-column label="状态" align="center" prop="status">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              active-color="#409EFF"
              inactive-color="#F56C6C"
              @change="changeStatus(scope.row, scope.row.status)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="restName" label="所在类名" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="reqMethod" label="请求方法" />
        <el-table-column label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudResource from '@/api/system/resource'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { resourceId: null, name: null, pattern: null, status: null, restName: null, remark: null, reqMethod: null }
export default {
  name: 'Resource',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '资源管理', url: 'api/sys/resources', idField: 'resourceId', sort: 'resourceId,desc', crudMethod: { ...crudResource }})
  },
  dicts: ['status'],
  data() {
    return {
      permission: {
        add: ['admin', 'resource:add'],
        edit: ['admin', 'resource:edit'],
        del: ['admin', 'resource:del']
      },
      rules: {
        pattern: [
          { required: true, message: 'URI不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'resourceId', display_name: 'ID' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      form.status = form.status.toString()
    },
    // 改变状态
    changeStatus(data, val) {
      this.$confirm('此操作将 "' + this.dict.label.status[val] + '" ' + data.name + ', 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudResource.edit(data).then(res => {
          this.crud.notify(this.dict.label.status[val] + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(() => {
          data.status = !data.status
        })
      }).catch(() => {
        data.status = !data.status
      })
    }
  }
}
</script>

<style scoped>

</style>

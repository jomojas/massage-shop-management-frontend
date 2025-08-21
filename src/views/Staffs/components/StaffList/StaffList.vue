<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import AddStaffDialog from './AddStaffDialog.vue'
import StaffFilter from './StaffFilter.vue'
import EditStaffDialog from './EditStaffDialog.vue'
import StaffTimeLine from './StaffTimeLine.vue'
// 假设你有如下API方法
import {
  fetchUndeletedStaffs,
  fetchDeletedStaffs,
  deleteStaff,
  editStaff,
  addStaff,
  restoreStaff,
} from '@/api/modules/staff'

// 页面加载时自动请求一次数据
onMounted(() => {
  fetchStaffs()
})

// 弹窗控制
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showFilterDialog = ref(false)
const showStaffTimeLine = ref(false)

// 状态与数据
const staffStatus = ref('undeleted')
const searchKeyword = ref('')
const tableData = ref([])
const currentFilters = ref({})
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)
const sortBy = ref('')
const orderType = ref('')

// 当前操作员工
const currentStaffId = ref(null)
const currentEditStaff = ref({})
// 当前操作时间线员工ID和姓名
const currentTimelineStaffId = ref(null)
const currentTimelineStaffName = ref('')

// 查询员工
const fetchStaffs = async (extra = {}) => {
  const params = {
    ...currentFilters.value,
    page: currentPage.value,
    page_size: pageSize.value,
    ...extra,
  }
  let res
  if (staffStatus.value === 'undeleted') {
    res = await fetchUndeletedStaffs(params)
  } else {
    res = await fetchDeletedStaffs(params)
  }
  tableData.value = res.employees
  total.value = res.totalEmployees || 0
}

// 排序字段映射
const sortFieldMap = {
  name: 'name',
  commission: 'commission',
}
const handleSortChange = ({ prop, order }) => {
  const sortByParam = sortFieldMap[prop] || prop
  if (!order) {
    sortBy.value = ''
    orderType.value = ''
    currentFilters.value = { ...currentFilters.value }
  } else {
    sortBy.value = sortByParam
    orderType.value = order === 'ascending' ? 'asc' : 'desc'
    currentFilters.value = { ...currentFilters.value, sortBy: sortBy.value, order: orderType.value }
  }
  currentPage.value = 1
  fetchStaffs()
}

// 高级筛选
const handleFilterSearch = (filters) => {
  currentFilters.value = { ...filters }
  currentPage.value = 1
  fetchStaffs()
}

// 添加员工
const handleAdd = async (staffData) => {
  const res = await addStaff(staffData)
  if (res === true || typeof res === 'string') {
    ElMessage.success('添加成功')
    fetchStaffs()
  }
}

// 编辑员工
const handleEdit = async (staffData) => {
  const res = await editStaff(currentStaffId.value, staffData)
  if (res === true || typeof res === 'string') {
    ElMessage.success('编辑成功')
    fetchStaffs()
  }
}

// 删除员工
const handleDeleteBtn = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该员工吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await deleteStaff(id)
    if (res === true || typeof res === 'string') {
      ElMessage.success('删除成功')
      fetchStaffs()
    }
  } catch (e) {}
}

// 恢复员工
const handleRestoreBtn = async (id) => {
  try {
    await ElMessageBox.confirm('确定恢复该员工吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await restoreStaff(id)
    if (res === true || typeof res === 'string') {
      ElMessage.success('恢复成功')
      fetchStaffs()
    }
  } catch (e) {}
}

// 编辑按钮
const handleEditBtn = (staff) => {
  currentEditStaff.value = { ...staff }
  currentStaffId.value = staff.id
  showEditDialog.value = true
}

// 状态切换
const handleStatusChange = () => {
  currentPage.value = 1
  fetchStaffs()
}

// 分页
const handlePageChange = (page) => {
  currentPage.value = page
  fetchStaffs()
}

// 简单搜索
const handleSimpleSearch = () => {
  currentFilters.value = { keyword: searchKeyword.value }
  currentPage.value = 1
  fetchStaffs()
}

// 处理行点击事件，展示员工本月服务时间线
const handleRowClick = (row) => {
  currentTimelineStaffId.value = row.id
  currentTimelineStaffName.value = row.name
  showStaffTimeLine.value = true
}

// 打开弹窗
const handleAddStaff = () => {
  showAddDialog.value = true
}
const handleFilterDialog = () => {
  showFilterDialog.value = true
}
</script>

<template>
  <!-- 这里可引入 StaffFilter、AddStaffDialog、EditStaffDialog 组件 -->
  <StaffFilter v-model="showFilterDialog" @search="handleFilterSearch" />
  <AddStaffDialog v-model="showAddDialog" @submit="handleAdd" />
  <EditStaffDialog v-model="showEditDialog" :staff="currentEditStaff" @submit="handleEdit" />
  <StaffTimeLine
    v-model="showStaffTimeLine"
    :staffId="currentTimelineStaffId"
    :staffName="currentTimelineStaffName"
  />

  <el-form>
    <el-form-item>
      <el-radio-group v-model="staffStatus" @change="handleStatusChange">
        <el-radio-button label="未删除" value="undeleted" />
        <el-radio-button label="已删除" value="deleted" />
      </el-radio-group>
    </el-form-item>
    <el-form-item class="add-staff">
      <el-button type="primary" @click="handleAddStaff">添加员工</el-button>
    </el-form-item>
    <el-form-item class="input-search">
      <el-input
        v-model="searchKeyword"
        placeholder="输入姓名或电话"
        clearable
        size="large"
        :suffix-icon="Search"
      />
    </el-form-item>
    <el-form-item class="search-btn">
      <el-button type="primary" @click="handleSimpleSearch">查询</el-button>
    </el-form-item>
    <el-form-item class="advanced-search">
      <el-button type="primary" @click="handleFilterDialog">高级查询</el-button>
    </el-form-item>
  </el-form>

  <div class="table-wrapper">
    <el-table
      :data="tableData"
      style="width: 100%"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <el-table-column fixed prop="createTime" label="创建时间" width="160" />
      <el-table-column
        prop="name"
        label="姓名"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="120"
      />
      <el-table-column prop="phone" label="电话" width="120" />
      <el-table-column
        prop="commission"
        label="提成比例"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="120"
        :formatter="(row) => (row.commission * 100).toFixed(2) + '%'"
      />
      <el-table-column fixed="right" label="操作" min-width="200">
        <template #default="{ row }">
          <template v-if="staffStatus === 'undeleted'">
            <el-button type="danger" @click.stop="handleDeleteBtn(row.id)">删除</el-button>
            <el-button type="primary" @click.stop="handleEditBtn(row)">编辑</el-button>
          </template>
          <template v-else>
            <el-button type="warning" @click.stop="handleRestoreBtn(row.id)">恢复</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pager"
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    />
  </div>
</template>

<style lang="scss" scoped>
.el-form {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-wrap: wrap;
  gap: 20px;

  :deep(.el-radio-button__inner) {
    font-size: $font-size-normal;
    background-color: var(--member-management-bg);
    color: var(--member-management-text);
  }

  .input-search {
    width: 50%;
    background-color: var(--member-management-bg);

    :deep(.el-input__wrapper) {
      background-color: var(--member-management-bg);
    }
  }
}

.table-wrapper {
  position: relative;
  height: 480px;
  .el-table {
    width: 100%;
    height: 430px;
    background-color: var(--member-management-bg);
    :deep(.el-table__border) {
      color: var(--member-management-border);
    }

    :deep(.el-table__row) {
      cursor: pointer;
      transition: background 0.2s;
      // 悬停时底色
      &:hover {
        background-color: blue !important;
      }
      // 点击时底色
      &:active {
        background-color: red !important;
      }
    }

    :deep(.el-table__cell) {
      background-color: var(--member-management-bg) !important;
      border-bottom: none;
      color: var(--member-management-text);
    }

    :deep(.el-table__empty-text) {
      color: var(--member-management-text);
    }
  }
  .pager {
    position: absolute;
    right: 10px;
    bottom: 10px;
  }
}
</style>

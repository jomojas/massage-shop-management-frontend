<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import AddEditStaffStatusDialog from './AddEditStaffStatusDialog.vue'
import StaffStatusFilter from './StaffStatusFilter.vue'
import {
  fetchStaffStatusList,
  fetchStaffStatusCategories,
  addStaffStatus,
  updateStaffStatus,
} from '@/api/modules/staff'
import { Search } from '@element-plus/icons-vue'

const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(8)
const loading = ref(false)
const statusDict = ref([])
const searchStatus = ref('') // ''表示全部

const searchKeyword = ref('')
const currentFilters = ref({})
const sortBy = ref('')
const orderType = ref('')

// 弹窗控制
const showFilterDialog = ref(false)
const showAddEditDialog = ref(false)
const dialogMode = ref('add') // 'add' or 'edit'
const currentEdit = ref(null)

// 获取状态字典
const getStatusDict = async () => {
  const res = await fetchStaffStatusCategories()
  statusDict.value = res || []
  // console.log('Status categories:', statusDict.value)
}

// 获取列表
const fetchList = async (extra = {}) => {
  loading.value = true
  try {
    const params = {
      ...currentFilters.value,
      keyword: searchKeyword.value,
      page: currentPage.value,
      size: pageSize.value,
      status: searchStatus.value || undefined,
      ...extra,
    }
    const res = await fetchStaffStatusList(params)
    tableData.value = res.records || []
    total.value = res.totalRecords || 0
    console.log('Fetched staff status list:', total.value)
  } catch (e) {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

// 排序字段映射
const sortFieldMap = {
  date: 'date',
  staffName: 'staff_name',
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
  fetchList()
}

// 高级筛选提交
const handleFilterSearch = (filters) => {
  currentFilters.value = { ...filters }
  currentPage.value = 1
  fetchList()
}

// 分页
const handlePageChange = (page) => {
  currentPage.value = page
  fetchList()
}

// 状态筛选
const handleStatusChange = () => {
  currentPage.value = 1
  fetchList()
}

// 查询
const handleSearch = () => {
  currentPage.value = 1
  fetchList()
}

// 高级筛选
const handleFilter = () => {
  showFilterDialog.value = true
}

// 新增
const handleAdd = () => {
  dialogMode.value = 'add'
  currentEdit.value = null
  showAddEditDialog.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogMode.value = 'edit'
  currentEdit.value = { ...row }
  showAddEditDialog.value = true
}

// 弹窗提交
const handleDialogSubmit = async (form) => {
  try {
    if (dialogMode.value === 'add') {
      await addStaffStatus(form.staffId, form)
      ElMessage.success('新增成功')
    } else {
      await updateStaffStatus(form.recordId, form)
      ElMessage.success('编辑成功')
    }
    showAddEditDialog.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  getStatusDict()
  fetchList()
})
</script>

<template>
  <StaffStatusFilter
    v-model="showFilterDialog"
    :status-dict="statusDict"
    @search="handleFilterSearch"
  />
  <AddEditStaffStatusDialog
    v-model="showAddEditDialog"
    :mode="dialogMode"
    :status-dict="statusDict"
    :edit-data="currentEdit"
    @submit="handleDialogSubmit"
  />

  <el-form class="filter-form">
    <el-form-item>
      <el-radio-group v-model="searchStatus" @change="handleStatusChange">
        <el-radio-button label="" value="">全部</el-radio-button>
        <el-radio-button v-for="item in statusDict" :key="item" :label="item" :value="item">
          {{ item }}
        </el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleAdd">新增状态</el-button>
    </el-form-item>
    <el-form-item class="input-search">
      <el-input
        v-model="searchKeyword"
        placeholder="姓名/电话"
        clearable
        size="large"
        :suffix-icon="Search"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="primary" @click="handleFilter">高级筛选</el-button>
    </el-form-item>
    <el-form-item> </el-form-item>
  </el-form>

  <div class="table-wrapper">
    <el-table :data="tableData" style="width: 100%" @sort-change="handleSortChange">
      <el-table-column
        prop="date"
        label="日期"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="120"
      />
      <el-table-column
        prop="staffName"
        label="员工姓名"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="120"
      />
      <el-table-column prop="phone" label="电话" width="120" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="remark" label="备注" min-width="200" />
      <el-table-column label="操作" fixed="right" width="150">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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
.filter-form {
  padding: 10px 10px 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-wrap: wrap;
  gap: 20px;
  background: var(--staff-management-bg);

  :deep(.el-radio-button__inner) {
    font-size: $font-size-normal;
    background-color: var(--member-management-bg);
    color: var(--member-management-text);
    transition: background-color 0s ease;
  }

  .input-search {
    width: 30%;
    background-color: var(--staff-management-bg);

    :deep(.el-input__wrapper) {
      background-color: var(--staff-management-bg);
    }
  }
}
.table-wrapper {
  position: relative;
  height: 410px;
  // margin-top: 10px;

  .el-table {
    width: 100%;
    height: 360px;
    background-color: var(--staff-management-bg);

    :deep(.el-table__cell) {
      background-color: var(--staff-management-bg) !important;
      border-bottom: none;
      color: var(--staff-management-text);
      transition: background-color 0s ease;
    }

    :deep(.el-table__empty-text) {
      color: var(--staff-management-text);
    }
  }
  .pager {
    position: absolute;
    right: 10px;
    bottom: 10px;
  }
}
</style>

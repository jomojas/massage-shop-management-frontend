<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import StaffServiceFilter from './StaffServiceFilter.vue'
// 假设你已实现该API
import { fetchStaffServiceRecords } from '@/api/modules/staff'
onMounted(() => {
  fetchRecords()
})

const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(8)
const loading = ref(false)

const searchKeyword = ref('')
const showFilterDialog = ref(false)
const currentFilters = ref({})
const sortBy = ref('')
const orderType = ref('')

const fetchRecords = async (extra = {}) => {
  loading.value = true
  try {
    const params = {
      ...currentFilters.value,
      keyword: searchKeyword.value,
      page: currentPage.value,
      page_size: pageSize.value,
      ...extra,
    }
    const res = await fetchStaffServiceRecords(params)
    tableData.value = res.records || []
    total.value = res.totalRecords || 0
  } catch (e) {
    ElMessage.error('查询失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchRecords()
}

const handleSimpleSearch = () => {
  currentPage.value = 1
  fetchRecords()
}

const handleFilterDialog = () => {
  showFilterDialog.value = true
}

const handleFilterSearch = (filters) => {
  currentFilters.value = { ...filters }
  currentPage.value = 1
  fetchRecords()
}

const sortFieldMap = {
  serviceTime: 'consumption_date', // 表格字段: 接口字段
  staffName: 'staff_name',
  earnings: 'earnings',
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
  fetchRecords()
}
</script>

<template>
  <!-- StaffServiceFilter 组件实现高级筛选 -->
  <StaffServiceFilter v-model="showFilterDialog" @search="handleFilterSearch" />

  <el-form>
    <el-form-item class="input-search">
      <el-input
        v-model="searchKeyword"
        placeholder="输入项目/会员/客户描述"
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
    <el-table :data="tableData" style="width: 100%" @sort-change="handleSortChange">
      <el-table-column
        fixed
        prop="serviceTime"
        label="服务日期"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="180"
      />
      <el-table-column
        prop="staffName"
        label="员工姓名"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="150"
      />
      <el-table-column prop="projectName" label="项目名称" width="120" />
      <el-table-column
        prop="earnings"
        label="服务收入"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="150"
        :formatter="(row) => row.earnings?.toFixed(2)"
      />
      <el-table-column
        prop="commission"
        label="提成比例"
        width="100"
        :formatter="(row) => (row.commission * 100).toFixed(2) + '%'"
      />
      <el-table-column prop="customerName" label="会员姓名" width="100" />
      <el-table-column prop="customerDesc" label="客户描述" width="300" />
      <el-table-column prop="recordDetail" label="服务详情" min-width="600" />
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
  gap: 20px;

  .input-search {
    width: 80%;
    background-color: var(--staff-management-bg);

    :deep(.el-input__wrapper) {
      background-color: var(--staff-management-bg);
    }
  }
}

.table-wrapper {
  position: relative;
  height: 420px;
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

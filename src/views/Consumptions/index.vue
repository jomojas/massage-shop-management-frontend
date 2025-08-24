<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchConsumptions, addConsumption, updateConsumption } from '@/api/modules/consumption'
import ConsumptionFilterDialog from './components/ConsumptionFilterDialog.vue'
import AddConsumptionDialog from './components/AddConsumptionDialog.vue'
import EditConsumptionDialog from './components/EditConsumptionDialog.vue'
import { editCharge } from '@/api/modules/member'

const showFilterDialog = ref(false)
// const showAddEditDialog = ref(false)
// const dialogMode = ref('add') // 'add' or 'edit'
const showAddDialog = ref(false)
const showEditDialog = ref(false)

const tableData = ref([])
const total = ref(0)

const currentFilters = ref({})
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
// 排序字段和顺序
const sortBy = ref('')
const orderType = ref('')

const currentEditRecord = ref(null)

// 查询消费记录
const fetchList = async () => {
  const params = {
    ...currentFilters.value,
    keyword: searchKeyword.value,
    sortBy: sortBy.value,
    order: orderType.value,
    page: currentPage.value,
    size: pageSize.value,
  }
  const res = await fetchConsumptions(params)
  const data = res.data || res
  tableData.value = data.consumptions || []
  total.value = data.totalConsumes || 0
}

const handleSimpleSearch = () => {
  currentFilters.value = {}
  sortBy.value = 'consume_time'
  orderType.value = 'desc'
  currentPage.value = 1
  fetchList()
}
const handleFilterSearch = (filters) => {
  currentFilters.value = { ...filters }
  searchKeyword.value = filters.keyword || ''
  sortBy.value = filters.sortBy || 'consume_time'
  orderType.value = filters.order || 'desc'
  currentPage.value = 1
  fetchList()
}

const sortFieldMap = {
  consumeTime: 'consume_time',
  name: 'name',
  totalPrice: 'total_price',
}
const handleSortChange = ({ prop, order }) => {
  if (!order) {
    // 未排序时恢复默认排序
    sortBy.value = 'created_time'
    orderType.value = 'desc'
  } else {
    sortBy.value = sortFieldMap[prop] || prop
    orderType.value = order === 'ascending' ? 'asc' : 'desc'
  }
  currentPage.value = 1
  fetchList()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchList()
}

// 新增
const handleAdd = () => {
  showAddDialog.value = true
}
// 编辑
const handleEdit = (row) => {
  currentEditRecord.value = { ...row }
  showEditDialog.value = true
}

// 添加消费记录回调函数
const handleAddSubmit = async (submitData) => {
  const res = await addConsumption(submitData)
  if (res === true || typeof res === 'string') {
    ElMessage.success('添加成功')
    fetchList()
  }
}

// 编辑消费记录回调函数
const handleEditSubmit = async (submitData) => {
  const res = await updateConsumption(currentEditRecord.value.recordId, submitData)
  if (res === true || typeof res === 'string') {
    ElMessage.success('编辑成功')
    fetchList()
  }
}

onMounted(() => {
  fetchList()
})
</script>

<template>
  <AddConsumptionDialog v-model="showAddDialog" @submit="handleAddSubmit" />
  <EditConsumptionDialog
    v-model="showEditDialog"
    :record="currentEditRecord"
    @submit="handleEditSubmit"
  />
  <ConsumptionFilterDialog v-model="showFilterDialog" @search="handleFilterSearch" />

  <el-form inline>
    <el-form-item class="input-search">
      <el-input v-model="searchKeyword" placeholder="姓名/电话/项目/员工/描述" clearable />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSimpleSearch">查询</el-button>
      <el-button @click="showFilterDialog = true">高级查询</el-button>
      <el-button type="primary" @click="handleAdd">新增消费</el-button>
    </el-form-item>
  </el-form>

  <div class="table-wrapper">
    <el-table
      :data="tableData"
      style="width: 100%; margin-top: 20px"
      @sort-change="handleSortChange"
    >
      <el-table-column
        prop="consumeTime"
        label="消费时间"
        fixed
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        width="180"
      >
        <template #default="{ row }">
          {{ row.consumeTime ? row.consumeTime.replace('T', ' ') : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="会员姓名"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        width="120"
      />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column prop="description" label="客户描述" width="300" />
      <el-table-column
        prop="totalPrice"
        label="消费金额"
        sortable="custom"
        :sort-orders="['descending', 'ascending']"
        width="120"
      />
      <el-table-column prop="recordDetail" label="消费明细" min-width="1000" />
      <el-table-column label="操作" width="100" fixed="right">
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
      style="margin-top: 20px; text-align: right"
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
    background-color: var(--project-management-bg);
    color: var(--project-management-text);
    transition: background-color 0s ease;
  }

  .input-search {
    width: 40%;
    background-color: var(--project-management-bg);

    :deep(.el-input__wrapper) {
      background-color: var(--project-management-bg);
    }
  }
}
.table-wrapper {
  position: relative;
  height: 450px;
  .el-table {
    width: 100%;
    height: 400px;
    background-color: var(--project-management-bg);

    :deep(.el-table__cell) {
      background-color: var(--project-management-bg) !important;
      border-bottom: none;
      color: var(--project-management-text);
      transition: background-color 0s ease;
    }
    :deep(.el-table__empty-text) {
      color: var(--project-management-text);
    }
  }
  .pager {
    position: absolute;
    right: 10px;
    bottom: 10px;
  }
}
</style>

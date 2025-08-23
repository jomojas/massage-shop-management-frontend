<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchExpenses,
  fetchDeletedExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  restoreExpense,
  fetchExpenseCategories,
} from '@/api/modules/expense'
import AddExpenseDialog from './components/AddExpenseDialog.vue'
import EditExpenseDialog from './components/EditExpenseDialog.vue'
import ExpenseFilterDialog from './components/ExpenseFilterDialog.vue'
import { Search } from '@element-plus/icons-vue'

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showFilterDialog = ref(false)

const tableData = ref([])
const total = ref(0)

const currentFilters = ref({})
const expenseStatus = ref('undeleted')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
// 排序字段和顺序
const sortBy = ref('')
const orderType = ref('')

const currentEditExpense = ref({})
const expenseCategories = ref([])

// 获取支出类别
const getCategories = async () => {
  const res = await fetchExpenseCategories()
  expenseCategories.value = Array.isArray(res) ? res : res.data
}

// 查询支出记录
const fetchExpenseList = async () => {
  const params = {
    ...currentFilters.value,
    keyword: searchKeyword.value,
    sortBy: sortBy.value,
    order: orderType.value,
    page: currentPage.value,
    size: pageSize.value,
  }
  let res
  if (expenseStatus.value === 'undeleted') {
    res = await fetchExpenses(params)
  } else {
    res = await fetchDeletedExpenses(params)
  }
  console.log('Fetched expenses:', res)
  const data = res.data || res

  tableData.value = data.records
  total.value = data.totalRecords || 0
}

// 排序
const sortFieldMap = {
  spendDate: 'spend_date',
  amount: 'amount',
}
const handleSortChange = ({ prop, order }) => {
  if (!order) {
    // 未排序时恢复默认排序
    sortBy.value = 'spend_date'
    orderType.value = 'desc'
  } else {
    sortBy.value = sortFieldMap[prop] || prop
    orderType.value = order === 'ascending' ? 'asc' : 'desc'
  }
  currentPage.value = 1
  fetchExpenseList()
}

// 高级筛选
const handleFilterSearch = (filters) => {
  currentFilters.value = { ...filters }
  searchKeyword.value = filters.keyword || ''
  sortBy.value = filters.sortBy || 'spend_date'
  orderType.value = filters.order || 'desc'
  currentPage.value = 1
  fetchExpenseList()
}

// 新增支出
const handleAddExpense = () => {
  showAddDialog.value = true
}
const handleAddExpenseSubmit = async (expenseData) => {
  const res = await addExpense(expenseData)
  if (res === true || typeof res === 'string') {
    ElMessage.success('添加成功')
  }
  fetchExpenseList()
}

// 编辑
const handleEditBtn = (expense) => {
  currentEditExpense.value = { ...expense }
  showEditDialog.value = true
}
const handleEditSubmit = async (updatedExpense) => {
  const res = await updateExpense(currentEditExpense.value.id, updatedExpense)
  if (res === true || typeof res === 'string') {
    ElMessage.success('编辑成功')
  }
  fetchExpenseList()
}

// 删除
const handleDeleteBtn = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该支出记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await deleteExpense(id)
    if (res === true || typeof res === 'string') {
      ElMessage.success('删除成功')
      fetchExpenseList()
    }
  } catch (e) {}
}

// 恢复
const handleRestoreBtn = async (id) => {
  try {
    await ElMessageBox.confirm('确定恢复该支出记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await restoreExpense(id)
    if (res === true || typeof res === 'string') {
      ElMessage.success('恢复成功')
      fetchExpenseList()
    }
  } catch (e) {}
}

// 状态切换
const handleStatusChange = () => {
  currentPage.value = 1
  fetchExpenseList()
}

// 分页
const handlePageChange = (page) => {
  currentPage.value = page
  fetchExpenseList()
}

// 简单查询
const handleSimpleSearch = () => {
  currentFilters.value = {}
  sortBy.value = 'spend_date'
  orderType.value = 'desc'
  currentPage.value = 1
  fetchExpenseList()
}

// 高级查询弹窗
const handleFilterDialog = () => {
  showFilterDialog.value = true
}

onMounted(() => {
  getCategories()
  fetchExpenseList()
})
</script>

<template>
  <AddExpenseDialog
    v-model="showAddDialog"
    :categories="expenseCategories"
    @submit="handleAddExpenseSubmit"
  />
  <EditExpenseDialog
    v-model="showEditDialog"
    :expense="currentEditExpense"
    :categories="expenseCategories"
    @submit="handleEditSubmit"
  />
  <ExpenseFilterDialog
    v-model="showFilterDialog"
    :categories="expenseCategories"
    @search="handleFilterSearch"
  />

  <el-form>
    <el-form-item>
      <el-radio-group v-model="expenseStatus" @change="handleStatusChange">
        <el-radio-button label="未删除" value="undeleted" />
        <el-radio-button label="已删除" value="deleted" />
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleAddExpense">新增支出</el-button>
    </el-form-item>
    <el-form-item class="input-search">
      <el-input
        v-model="searchKeyword"
        placeholder="输入描述"
        clearable
        size="large"
        :suffix-icon="Search"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSimpleSearch">查询</el-button>
      <el-button type="primary" @click="handleFilterDialog">高级查询</el-button>
    </el-form-item>
  </el-form>

  <div class="table-wrapper">
    <el-table :data="tableData" style="width: 100%" @sort-change="handleSortChange">
      <el-table-column
        prop="spendDate"
        label="支出日期"
        fixed
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="120"
      />
      <el-table-column prop="category" label="类别" width="120" />
      <el-table-column
        prop="amount"
        label="金额"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="100"
      />
      <el-table-column prop="description" label="描述" min-width="300" />
      <el-table-column prop="createTime" label="创建时间" width="160">
        <template #default="{ row }">
          {{ row.createTime ? row.createTime.replace('T', ' ') : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="更新时间" width="160">
        <template #default="{ row }">
          {{ row.updateTime ? row.updateTime.replace('T', ' ') : '-' }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" min-width="180">
        <template #default="{ row }">
          <template v-if="expenseStatus === 'undeleted'">
            <el-button type="danger" link @click.stop="handleDeleteBtn(row.id)">删除</el-button>
            <el-button type="primary" link @click.stop="handleEditBtn(row)">编辑</el-button>
          </template>
          <template v-else>
            <el-button type="warning" link @click.stop="handleRestoreBtn(row.id)">恢复</el-button>
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

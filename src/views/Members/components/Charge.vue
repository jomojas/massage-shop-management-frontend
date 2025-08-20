<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit, Search } from '@element-plus/icons-vue'
import ChargeFilter from './ChargeFilter.vue'
import EditChargeDialog from './EditChargeDialog.vue'
import { fetchRechargeRecords, editCharge } from '@/api/modules/member'
import { pa } from 'element-plus/es/locales.mjs'
// 页面加载时自动请求一次数据
onMounted(() => {
  fetchCharges()
})

// 用于存储当前编辑的充值数据
const currentEditCharge = ref({})
// 用于存储当前操作的充值记录ID
const currentChargeId = ref(null)

const showFilterDialog = ref(false)
const showEditDialog = ref(false)

const searchKeyword = ref('')
const tableData = ref([])
const currentFilters = ref({})
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)
// 排序字段和顺序
const sortBy = ref('')
const orderType = ref('')

// 查询函数，合并filters、分页参数，根据memberStatus调用不同接口
const fetchCharges = async (extra = {}) => {
  const params = {
    ...currentFilters.value,
    page: currentPage.value,
    size: pageSize.value,
    ...extra,
  }
  // console.log('Fetching charges with params:', params)
  let res = await fetchRechargeRecords(params)
  tableData.value = res.list
  total.value = res.totalRecords || 0
  // console.log('tableData:', tableData.value)
  // console.log('total:', total.value)
}

// 高级筛选弹窗回调
const handleFilterSearch = (filters) => {
  currentFilters.value = { ...filters }
  currentPage.value = 1
  fetchCharges()
}

// 仅通过keyword搜索
const handleSimpleSearch = () => {
  currentFilters.value = { keyword: searchKeyword.value }
  currentPage.value = 1
  fetchCharges()
}

// 解决sortBy查询是created_time但是返回的会员信息中却是createdTime的问题
const sortFieldMap = {
  rechargeTime: 'recharge_time',
  memberName: 'name',
  amount: 'amount',
}
// 表头排序事件
const handleSortChange = ({ prop, order }) => {
  // 将createdTime转换为created_time
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
  // console.log('Sorting by:', sortBy.value, 'Order:', orderType.value)
  currentPage.value = 1
  fetchCharges()
}

const handleEditBtn = (charge) => {
  // console.log('Editing charge:', charge)
  currentEditCharge.value = { ...charge } // 复制当前行数据
  currentChargeId.value = charge.id // 设置当前操作的充值记录ID
  showEditDialog.value = true
}

// 编辑充值回调
const handleEditSubmit = async (chargeData) => {
  // 这里假设 chargeData 是编辑后的充值数据
  const res = await editCharge(currentChargeId.value, chargeData)
  if (res === true || typeof res === 'string') {
    ElMessage.success('编辑成功')
    fetchCharges()
  }
}

// 分页回调
const handlePageChange = (page) => {
  currentPage.value = page
  fetchCharges()
}

const handleFilterDialog = () => {
  showFilterDialog.value = true
}
</script>

<template>
  <ChargeFilter v-model="showFilterDialog" @search="handleFilterSearch" />
  <EditChargeDialog
    v-model="showEditDialog"
    :charge="currentEditCharge"
    @submit="handleEditSubmit"
  />

  <el-form>
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
    <el-form-item classs="advanced-search">
      <el-button type="primary" @click="handleFilterDialog">高级查询</el-button>
    </el-form-item>
  </el-form>

  <div class="table-wrapper">
    <el-table :data="tableData" style="width: 100%" @sort-change="handleSortChange">
      <el-table-column
        fixed
        prop="rechargeTime"
        label="充值时间"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="160"
      />
      <el-table-column
        prop="memberName"
        label="姓名"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="120"
      />
      <el-table-column prop="memberPhone" label="电话" width="120" />
      <el-table-column
        prop="amount"
        label="充值金额"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="120"
      />
      <el-table-column prop="remark" label="描述信息" width="400" />
      <el-table-column fixed="right" label="操作" min-width="150">
        <template #default="{ row }">
          <el-button type="primary" @click="handleEditBtn(row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pager"
      background
      layout="prev, pager, next"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
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

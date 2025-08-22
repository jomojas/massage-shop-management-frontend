<script setup>
import { Search } from '@element-plus/icons-vue'
import AddMemberDialog from './AddMemberDialog.vue'
import EditMemberDialog from './EditMemberDialog.vue'
import MemberFilter from './MemberFilter.vue'
import RechargeDialog from './RechargeDialog.vue'
import MemberTimeLine from './MemberTimeLine.vue'
import { ref, onMounted } from 'vue'
import {
  fetchUndeletedMembers,
  fetchDeletedMembers,
  deleteMember,
  rechargeMember,
  editMember,
  addMember,
  restoreMember,
} from '@/api/modules/member'
import { ElMessage } from 'element-plus'
import { ElMessageBox } from 'element-plus'
// 页面加载时自动请求一次数据
onMounted(() => {
  fetchMembers()
})

const showFilterDialog = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showRechargeDialog = ref(false)
const showMemberTimeLine = ref(false)

const memberStatus = ref('undeleted')
const searchKeyword = ref('')
const tableData = ref([])
const currentFilters = ref({})
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)
// 排序字段和顺序
const sortBy = ref('')
const orderType = ref('')

// 用于存储当前操作的时间线会员ID
const currentTimelineMemberId = ref(null)
// 用于存储当前操作的时间线会员姓名
const currentTimelineMemberName = ref('')

// 用于存储当前操作的会员ID
const currentMemberId = ref(null)
// 用于存储当前编辑的会员数据
const currentEditMember = ref({})

// 查询函数，合并filters、分页参数，根据memberStatus调用不同接口
const fetchMembers = async (extra = {}) => {
  const params = {
    ...currentFilters.value,
    page: currentPage.value,
    size: pageSize.value,
    ...extra,
  }
  // console.log('Fetching members with params:', params)
  let res
  if (memberStatus.value === 'undeleted') {
    res = await fetchUndeletedMembers(params)
  } else {
    res = await fetchDeletedMembers(params)
  }
  tableData.value = res.members
  total.value = res.totalMembers || 0
}

// 解决sortBy查询是created_time但是返回的会员信息中却是createdTime的问题
const sortFieldMap = {
  createdTime: 'created_time',
  name: 'name',
  balance: 'balance',
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
  fetchMembers()
}

// 高级筛选弹窗回调
const handleFilterSearch = (filters) => {
  currentFilters.value = { ...filters }
  currentPage.value = 1
  fetchMembers()
}

// 会员充值回调
const handleRecharge = async ({ amount, remark }) => {
  // 这里假设 currentMemberId 是你要充值的会员id
  const res = await rechargeMember(currentMemberId.value, { amount, remark })
  if (res === true || typeof res === 'string') {
    ElMessage.success('充值成功')
    fetchMembers()
  }
}

// 添加会员回调
const handleAdd = async (memberData) => {
  // 这里假设 memberData 是添加的会员数据
  const res = await addMember(memberData)
  if (res === true || typeof res === 'string') {
    ElMessage.success('添加成功')
    fetchMembers()
  }
}

// 编辑会员回调
const handleEdit = async (memberData) => {
  // 这里假设 memberData 是编辑后的会员数据
  const res = await editMember(currentMemberId.value, memberData)
  if (res === true || typeof res === 'string') {
    ElMessage.success('编辑成功')
    fetchMembers()
  }
}

// 状态切换
const handleStatusChange = () => {
  currentPage.value = 1
  fetchMembers()
}

// 分页回调
const handlePageChange = (page) => {
  currentPage.value = page
  fetchMembers()
}

// 仅通过keyword搜索
const handleSimpleSearch = () => {
  currentFilters.value = { keyword: searchKeyword.value }
  currentPage.value = 1
  fetchMembers()
}

const handleFilterDialog = () => {
  showFilterDialog.value = true
}
const handleAddMember = () => {
  showAddDialog.value = true
}
const handleEditBtn = (member) => {
  currentEditMember.value = { ...member } // 复制当前行数据
  currentMemberId.value = member.id // 设置当前操作的会员ID
  showEditDialog.value = true
}

const handleDeleteBtn = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该会员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await deleteMember(id)
    if (res === true || typeof res === 'string') {
      ElMessage.success('删除成功')
      fetchMembers()
    }
  } catch (e) {
    // 用户取消，无需处理
  }
}
const handleRestoreBtn = async (id) => {
  try {
    await ElMessageBox.confirm('确定恢复该会员吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await restoreMember(id)
    if (res === true || typeof res === 'string') {
      ElMessage.success('恢复成功')
      fetchMembers()
    }
  } catch (e) {
    // 用户取消，无需处理
  }
}

// 处理行点击事件，展示会员本月消费时间线
const handleRowClick = (row) => {
  currentTimelineMemberId.value = row.id
  currentTimelineMemberName.value = row.name
  showMemberTimeLine.value = true
}

// 充值按钮点击事件
const handleChargeBtn = (id) => {
  currentMemberId.value = id
  showRechargeDialog.value = true
}
</script>

<template>
  <MemberFilter v-model="showFilterDialog" @search="handleFilterSearch" />
  <AddMemberDialog v-model="showAddDialog" @submit="handleAdd" />
  <EditMemberDialog v-model="showEditDialog" :member="currentEditMember" @submit="handleEdit" />
  <RechargeDialog v-model="showRechargeDialog" @submit="handleRecharge" />
  <MemberTimeLine
    v-model="showMemberTimeLine"
    :memberId="currentTimelineMemberId"
    :memberName="currentTimelineMemberName"
  />

  <el-form>
    <el-form-item>
      <el-radio-group v-model="memberStatus" @change="handleStatusChange">
        <el-radio-button label="未删除" value="undeleted" />
        <el-radio-button label="已删除" value="deleted" />
      </el-radio-group>
    </el-form-item>
    <el-form-item class="add-member">
      <el-button type="primary" @click="handleAddMember">添加会员</el-button>
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
    <el-form-item classs="advanced-search">
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
      <el-table-column
        fixed
        prop="createdTime"
        label="创建时间"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="160"
      />
      <el-table-column
        prop="name"
        label="姓名"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="120"
      />
      <el-table-column prop="phone" label="电话" width="120" />
      <el-table-column
        prop="balance"
        label="余额"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="120"
      />
      <el-table-column prop="description" label="描述信息" width="400" />
      <el-table-column fixed="right" label="操作" min-width="230">
        <template #default="{ row }">
          <template v-if="memberStatus === 'undeleted'">
            <el-button type="danger" @click.stop="handleDeleteBtn(row.id)">删除</el-button>
            <el-button type="primary" @click.stop="handleEditBtn(row)">编辑</el-button>
            <el-button type="success" @click.stop="handleChargeBtn(row.id)">充值</el-button>
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
    transition: background-color 0s ease;
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
      transition: background-color 0s ease;
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

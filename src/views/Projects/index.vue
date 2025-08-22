<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import {
  fetchProjects,
  fetchDeletedProjects,
  deleteProject,
  restoreProject,
  fetchProjectCategories,
  addProject,
  addProjectCategory,
  updateProject,
} from '@/api/modules/project'
import AddProjectDialog from './components/AddProjectDialog.vue'
import EditProjectDialog from './components/EditProjectDialog.vue'
import AddCategoryDialog from './components/AddCategoryDialog.vue'
import ProjectFilterDialog from './components/ProjectFilterDialog.vue'

const projectStatus = ref('undeleted')
const searchKeyword = ref('')
const tableData = ref([])
const currentFilters = ref({})
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)
const sortBy = ref('')
const orderType = ref('')

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showAddCategoryDialog = ref(false)
const showFilterDialog = ref(false)
const currentEditProject = ref({})
const projectCategories = ref([])

// 获取项目类别
const getCategories = async () => {
  const res = await fetchProjectCategories()
  // 这里假设apiRequest返回的就是string[]，如不是请改为res.data
  projectCategories.value = Array.isArray(res) ? res : res.data
}

// 查询项目
const fetchProjectList = async (extra = {}) => {
  const params = {
    ...currentFilters.value,
    page: currentPage.value,
    size: pageSize.value,
    ...extra,
  }
  let res
  if (projectStatus.value === 'undeleted') {
    res = await fetchProjects(params)
  } else {
    res = await fetchDeletedProjects(params)
  }
  tableData.value = res.projects
  total.value = res.totalProjects || 0
}

// 排序
const sortFieldMap = {
  name: 'name',
  priceGuest: 'price_guest',
  priceMember: 'price_member',
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
  fetchProjectList()
}

// 高级筛选
const handleFilterSearch = (filters) => {
  currentFilters.value = { ...filters }
  currentPage.value = 1
  fetchProjectList()
}

// 新增项目
const handleAddProject = () => {
  showAddDialog.value = true
}
const handleAddProjectSubmit = async (projectData) => {
  const res = await addProject(projectData)
  if (res === true || typeof res === 'string') {
    ElMessage.success('添加成功')
  }
  fetchProjectList()
}

// 新增类别
const handleAddCategory = () => {
  showAddCategoryDialog.value = true
}
const handleAddCategorySubmit = async (categoryData) => {
  const res = await addProjectCategory(categoryData)
  // console.log('添加类别结果:', res)
  if (res === true || typeof res === 'string') {
    ElMessage.success('类别添加成功')
  }
  getCategories()
}

// 编辑
const handleEditBtn = (project) => {
  currentEditProject.value = { ...project }
  showEditDialog.value = true
}
const handleEditSubmit = async (updatedProject) => {
  const res = await updateProject(currentEditProject.value.id, updatedProject)
  if (res === true || typeof res === 'string') {
    ElMessage.success('项目编辑成功')
  }
  fetchProjectList()
}

// 删除
const handleDeleteBtn = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await deleteProject(id)
    if (res === true || typeof res === 'string') {
      ElMessage.success('删除成功')
      fetchProjectList()
    }
  } catch (e) {}
}

// 恢复
const handleRestoreBtn = async (id) => {
  try {
    await ElMessageBox.confirm('确定恢复该项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await restoreProject(id)
    if (res === true || typeof res === 'string') {
      ElMessage.success('恢复成功')
      fetchProjectList()
    }
  } catch (e) {}
}

// 状态切换
const handleStatusChange = () => {
  currentPage.value = 1
  fetchProjectList()
}

// 分页
const handlePageChange = (page) => {
  currentPage.value = page
  fetchProjectList()
}

// 简单查询
const handleSimpleSearch = () => {
  currentFilters.value = { keyword: searchKeyword.value }
  currentPage.value = 1
  fetchProjectList()
}

// 高级查询弹窗
const handleFilterDialog = () => {
  showFilterDialog.value = true
}

onMounted(() => {
  getCategories()
  fetchProjectList()
})
</script>

<template>
  <AddProjectDialog
    v-model="showAddDialog"
    :categories="projectCategories"
    @submit="handleAddProjectSubmit"
  />
  <EditProjectDialog
    v-model="showEditDialog"
    :project="currentEditProject"
    :categories="projectCategories"
    @submit="handleEditSubmit"
  />
  <AddCategoryDialog v-model="showAddCategoryDialog" @submit="handleAddCategorySubmit" />
  <ProjectFilterDialog
    v-model="showFilterDialog"
    :categories="projectCategories"
    @search="handleFilterSearch"
  />

  <el-form>
    <el-form-item>
      <el-radio-group v-model="projectStatus" @change="handleStatusChange">
        <el-radio-button label="未删除" value="undeleted" />
        <el-radio-button label="已删除" value="deleted" />
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleAddProject">新增项目</el-button>
      <el-button type="primary" @click="handleAddCategory">新增类别</el-button>
    </el-form-item>
    <el-form-item class="input-search">
      <el-input
        v-model="searchKeyword"
        placeholder="输入项目名称或类别"
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
        prop="name"
        label="项目名称"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="160"
      />
      <el-table-column prop="category" label="类别" width="120" />
      <el-table-column
        prop="priceGuest"
        label="客人价"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="100"
      />
      <el-table-column
        prop="priceMember"
        label="会员价"
        sortable="custom"
        :sort-orders="['ascending', 'descending']"
        width="100"
      />
      <el-table-column prop="description" label="描述" min-width="200" />
      <el-table-column prop="createdTime" label="创建时间" width="160" />
      <el-table-column prop="updatedTime" label="更新时间" width="160" />
      <el-table-column fixed="right" label="操作" min-width="180">
        <template #default="{ row }">
          <template v-if="projectStatus === 'undeleted'">
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
  height: 480px;
  .el-table {
    width: 100%;
    height: 430px;
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

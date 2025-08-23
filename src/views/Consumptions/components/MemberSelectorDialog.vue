<script setup>
import { defineProps, defineEmits, ref, watch, inject } from 'vue'
import { fetchUndeletedMembers } from '@/api/modules/member'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'select'])

const tableData = ref([])
const total = ref(0)

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(8)

const fetchMembers = async () => {
  const params = {
    keyword: searchKeyword.value,
    page: currentPage.value,
    size: pageSize.value,
  }
  const res = await fetchUndeletedMembers(params)
  tableData.value = res.members || []
  total.value = res.totalMembers || 0
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) fetchMembers()
  },
)

const handleSearch = () => {
  currentPage.value = 1
  fetchMembers()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchMembers()
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSelect = (row) => {
  emit('select', row)
  emit('update:modelValue', false)
}

const isMobile = inject('isMobile', false)
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="选择会员"
    :width="isMobile ? '90%' : '500px'"
    :before-close="handleClose"
  >
    <el-input
      v-model="searchKeyword"
      placeholder="搜索会员姓名/手机号"
      clearable
      @input="handleSearch"
      style="margin-bottom: 12px"
    />
    <el-table
      :data="tableData"
      highlight-current-row
      @row-click="handleSelect"
      style="width: 100%"
      max-height="350"
    >
      <el-table-column prop="name" label="姓名" width="150" />
      <el-table-column prop="phone" label="手机号" width="200" />
      <el-table-column prop="balance" label="余额" width="100" />
    </el-table>
    <el-pagination
      class="pager"
      v-if="total > pageSize"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="handlePageChange"
    />
  </el-dialog>
</template>

<style lang="scss" scoped>
.el-table {
  height: 400px;
  background-color: var(--consume-management-bg);
  :deep(.el-table__border) {
    color: var(--consume-management-border);
  }

  :deep(.el-table__row) {
    cursor: pointer;
  }
  :deep(.el-table__cell) {
    background-color: var(--consume-management-bg) !important;
    border-bottom: none;
    color: var(--consume-management-text);
    transition: background-color 0s ease;
  }

  :deep(.el-table__empty-text) {
    color: var(--consume-management-text);
  }
}
.pager {
  margin-top: 10px;
}
</style>

<script setup>
import { useDashboardStore } from '@/stores/dashboard'
import { computed, onMounted } from 'vue'

const dashboardStore = useDashboardStore()
// 安全的计算属性，提供默认值
// const statsData = computed(() => ({
//   totalIncome: dashboardStore.statsData?.totalIncome || 0,
//   netIncome: dashboardStore.statsData?.netIncome || 0,
//   totalExpense: dashboardStore.statsData?.totalExpense || 0,
// }))
const statsData = computed(() => {
  const data = dashboardStore.statsData || {}
  return {
    totalIncome: data.totalIncome || 0,
    netIncome: data.netIncome || 0,
    totalExpense: data.totalExpense || 0,
  }
})

// 组件挂载时获取数据
onMounted(() => {
  dashboardStore.fetchAllData()
})
</script>

<template>
  <div class="main-container">
    <el-row>
      <el-col :span="8">
        <el-statistic title="总收入" :value="statsData.totalIncome" />
      </el-col>
      <el-col :span="8">
        <el-statistic title="净收入" :value="statsData.netIncome" />
      </el-col>
      <el-col :span="8">
        <el-statistic title="总支出" :value="statsData.totalExpense" />
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  padding: 10px;

  :deep(.el-statistic .el-statistic__head) {
    font-size: $font-size-normal;
    color: var(--dashcard-text) !important;
  }
  :deep(.el-statistic .el-statistic__number) {
    font-size: $font-size-large;
    color: var(--dashcard-text) !important;
  }
}
</style>

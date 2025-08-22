<script setup>
import { useDashboardStore } from '@/stores/dashboard'
import { ref, computed } from 'vue'

const dashboardStore = useDashboardStore()
// 直接用 pinia 的 timeRange，保证和全局同步
const range = computed({
  get: () => dashboardStore.timeRange,
  set: (val) => dashboardStore.setTimeRange(val),
})

const handleTimeChange = (range) => {
  dashboardStore.setTimeRange(range) // 自动触发所有数据更新
}
</script>

<template>
  <div class="main-container">
    <el-radio-group v-model="range" size="large" @change="handleTimeChange">
      <el-radio-button label="本周" value="week" />
      <el-radio-button label="本月" value="month" />
      <el-radio-button label="本年" value="year" />
      <el-radio-button label="全部" value="all" />
    </el-radio-group>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0 10px 0;

  :deep(.el-radio-button__inner) {
    font-size: $font-size-normal;
    background-color: var(--dashcard-bg);
    color: var(--dashcard-text);
    transition:
      background-color 0s,
      ease;
  }
}
</style>

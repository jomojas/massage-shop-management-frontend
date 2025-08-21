<script setup>
import { useStaffStatsStore } from '@/stores/staffs/staffStats'
import { ref } from 'vue'

const staffStatsStore = useStaffStatsStore()
const range = ref('week')

const handleTimeChange = (range) => {
  staffStatsStore.setTimeRange(range) // 自动触发所有数据更新
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
    background-color: var(--staff-management-bg);
    color: var(--staff-management-text);
  }
}
</style>

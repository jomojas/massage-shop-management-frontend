<script setup>
import TimeSelector from './TimeSelector.vue'
import StaffSalaries from './StaffSalaries.vue'
import Charts from './Charts.vue'
</script>

<template>
  <div class="main-content">
    <el-card class="time-selector">
      <TimeSelector />
    </el-card>
    <el-card class="staff-salaries">
      <StaffSalaries />
    </el-card>
    <el-card class="charts">
      <Charts />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.main-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  .time-selector {
    grid-column: 1 / -1;

    :deep(.el-card__body) {
      height: 100%;
      background-color: var(--staff-management-bg);
      color: var(--staff-management-text);
    }
  }
  .staff-salaries {
    grid-column: 1 / -1;

    :deep(.el-card__body) {
      height: 100%;
      background-color: var(--staff-management-bg);
      color: var(--staff-management-text);
    }
  }
  .charts {
    grid-column: 1 / -1;

    :deep(.el-card__body) {
      padding: 0;
    }
  }
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;

    .time-selector,
    .line-chart,
    .stats-displayer,
    .pie-chart-consume,
    .pie-chart-project {
      grid-column: 1 / -1; // 全部占满一行
    }
  }
}
</style>

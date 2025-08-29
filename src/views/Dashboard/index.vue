<script setup>
import { onMounted, onActivated, onUnmounted } from 'vue'
import ConsumePie from './components/ConsumePie.vue'
import LineChart from './components/LineChart.vue'
import ProjectPie from './components/ProjectPie.vue'
import StatsDisplayer from './components/StatsDisplayer.vue'
import TimeSelector from './components/TimeSelector.vue'
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()
onMounted(() => {
  dashboardStore.fetchAllData() // 初始加载数据
  dashboardStore.startPolling()
})
onUnmounted(() => {
  dashboardStore.stopPolling()
})
</script>

<template>
  <div class="main-content">
    <el-card class="time-selector">
      <TimeSelector />
    </el-card>
    <el-card class="stats-displayer">
      <StatsDisplayer />
    </el-card>
    <el-card class="line-chart">
      <LineChart />
    </el-card>
    <el-card class="pie-chart-consume">
      <ConsumePie />
    </el-card>
    <el-card class="pie-chart-project">
      <ProjectPie />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.main-content {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  .time-selector {
    grid-column: 1 / 3;

    :deep(.el-card__body) {
      height: 100%;
      background-color: var(--dashcard-bg);
      color: var(--dashcard-text);
    }
  }
  .stats-displayer {
    grid-column: 3 / 5;

    :deep(.el-card__body) {
      height: 100%;
      background-color: var(--dashcard-bg);
      color: var(--dashcard-text);
    }
  }
  .line-chart {
    grid-column: 1 / -1;

    :deep(.el-card__body) {
      padding: 0;
    }
  }
  .pie-chart-consume {
    grid-column: 1 / 3;

    :deep(.el-card__body) {
      padding: 0;
    }
  }
  .pie-chart-project {
    grid-column: 3 / 5;

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

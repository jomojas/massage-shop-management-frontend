<script setup>
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'
import { computed, ref } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

use([LineChart, CanvasRenderer, TooltipComponent, GridComponent, LegendComponent])

const dashboardStore = useDashboardStore()
const chartData = computed(() => dashboardStore.lineChartData)

const xData = computed(() => chartData.value.xData)
const income = computed(() => chartData.value.income)
const netIncome = computed(() => chartData.value.netIncome)

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: xData.value,
  },
  legend: {
    data: [
      {
        name: '总收入',
        textStyle: {
          color: '#5470c6',
          fontSize: 12,
        },
      },
      {
        name: '净收入',
        textStyle: {
          color: '#91cc75',
          fontSize: 12,
        },
      },
    ],
    top: '15px',
    left: 'center',
    orient: 'horizontal',
    itemWidth: 30,
    itemHeight: 15,
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '总收入',
      data: income.value,
      type: 'line',
      smooth: true,
    },
    {
      name: '净收入',
      data: netIncome.value,
      type: 'line',
      smooth: true,
    },
  ],
}))
</script>

<template>
  <div class="chart-body">
    <v-chart
      :option="option"
      :autoresize="true"
      style="height: 400px; width: 100%"
      :init-options="{ renderer: 'canvas' }"
    />
  </div>
</template>

<style lang="scss" scoped>
.chart-body {
  width: 100%;
  height: 400px;
  background-color: var(--dashcard-bg);
  color: var(--dashcard-text);
}
</style>

<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useStaffStatsStore } from '@/stores/staffs/staffStats'
import { use } from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
} from 'echarts/components'
import { color } from 'echarts'
// import { getCssVar } from 'element-plus'

use([
  LineChart,
  PieChart,
  CanvasRenderer,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
])

const staffStatsStore = useStaffStatsStore()
const source = computed(() => staffStatsStore.chartData)
const option = ref({})
const chartRef = ref() // 用于获取 v-chart 实例
// 假设 staffIncomeList 是 [{ name: '张三', income: 1000 }, ...]
const staffIncomeList = computed(() => staffStatsStore.incomeData)

const colorList = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
]

// 找到最大收益员工的索引
const maxIncomeIndex = computed(() => {
  if (!staffIncomeList.value.length) return 0
  let max = -Infinity
  let idx = 0
  staffIncomeList.value.forEach((item, i) => {
    if (item.value > max) {
      max = item.value
      idx = i
    }
  })
  return idx
})

// 统计图表标题颜色和带来收益最多的员工颜色相同
const titleColor = computed(() => colorList[maxIncomeIndex.value % colorList.length])

// pie 数据
const pieData = computed(() =>
  staffIncomeList.value.map((item, idx) => ({
    name: item.name,
    value: item.value,
    itemStyle: { color: colorList[idx % colorList.length] },
  })),
)

watch(source, (val) => {
  // console.log('Source data changed:', val)
  if (!val || !Array.isArray(val) || val.length < 2) return

  // 动态生成 line series
  const series = val.slice(1).map((row, idx) => ({
    name: row[0], // 员工名
    type: 'line',
    smooth: true,
    seriesLayoutBy: 'row',
    emphasis: { focus: 'series' },
    color: colorList[idx % colorList.length],
  }))

  // 添加 pie series
  series.push({
    type: 'pie',
    id: 'pie',
    radius: '30%',
    center: ['50%', '30%'],
    emphasis: { focus: 'self' },
    label: {
      formatter: (params) => {
        return `{color${params.dataIndex}|${params.name}: ${params.data.value} (${params.percent}%)}`
      },
      rich: Object.fromEntries(
        staffIncomeList.value.map((item, idx) => [
          `color${idx}`,
          { color: colorList[idx % colorList.length], fontSize: 14 },
        ]),
      ),
    },
    data: pieData.value,
  })

  option.value = {
    title: {
      text: '员工带来收益趋势与对比图',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: titleColor.value,
      },
    },
    color: colorList, // 让折线和 legend 的图标颜色一致
    legend: {
      top: '45px',
      left: 'center',
      orient: 'horizontal',
      itemWidth: 30,
      itemHeight: 15,
      data: val.slice(1).map((row, idx) => ({
        name: row[0],
        textStyle: {
          color: colorList[idx % colorList.length], // 描述字体颜色
          fontSize: 12,
        },
      })),
    },
    tooltip: {
      trigger: 'axis',
      showContent: true,
    },
    dataset: { source: val },
    xAxis: { type: 'category' },
    yAxis: { gridIndex: 0 },
    grid: { top: '55%' },
    series,
  }
})

onMounted(async () => {
  staffStatsStore.fetchAllData()
})
</script>

<template>
  <div class="chart-body">
    <el-empty v-if="!source || !source.length || source.length < 2" description="暂无数据" />
    <v-chart
      v-else
      ref="chartRef"
      :option="option"
      :autoresize="true"
      style="height: 600px; width: 100%"
      :init-options="{ renderer: 'canvas' }"
    />
  </div>
</template>

<style lang="scss" scoped>
.chart-body {
  padding-top: 10px;
  width: 100%;
  height: auto;
  background-color: var(--staff-management-bg);
  color: var(--staff-management-text);
}
</style>

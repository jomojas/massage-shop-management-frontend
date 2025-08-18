<script setup>
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import { useDashboardStore } from '@/stores/dashboard'

// 注册组件
use([PieChart, CanvasRenderer, TooltipComponent, LegendComponent, TitleComponent])

const dashboardStore = useDashboardStore()

const pieColors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']

const data = computed(() => dashboardStore.projectData)

// 创建排序后的数据
const sortedData = computed(() => {
  return [...data.value].sort((a, b) => b.value - a.value) // 降序排列
})

const total = computed(() => data.value.reduce((sum, item) => sum + item.value, 0))
const option = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      const percentage = ((params.value / total.value) * 100).toFixed(1)
      const color = pieColors[params.dataIndex] // 通过索引获取颜色
      const colorDot = `<span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${color};"></span>`
      return `${colorDot}${params.name}<br/>数值: ${params.value}<br/>占比: ${percentage}%`
    },
  },
  legend: {
    top: '5%',
    left: 'center',
    data: sortedData.value.map((item, index) => ({
      name: item.name,
      textStyle: {
        color: pieColors[index], // 使用对应的扇形颜色
        fontSize: 12,
      },
    })),
  },
  series: [
    {
      name: '项目',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: sortedData.value,
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

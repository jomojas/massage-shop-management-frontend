import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchStatsData as apiFetchStatsData,
  fetchConsumeData as apiFetchConsumeData,
  fetchProjectData as apiFetchProjectData,
  fetchIncomeLineChartData as apiFetchIncomeLineChartData,
  fetchNetIncomeLineChartData as apiFetchNetIncomeLineChartData,
} from '@/api/modules/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  // 状态定义
  const timeRange = ref('week') // 'week', 'month', 'quarter', 'year'
  const loading = ref(false)
  const error = ref<unknown>(null)

  // 图表数据
  const lineChartData = ref({
    xData: <String[]>[],
    income: <Number[]>[],
    netIncome: <Number[]>[],
  })

  const statsData = ref({
    totalIncome: 0,
    netIncome: 0,
    totalExpense: 0,
  })

  const consumeData = ref<{ name: string; value: number }[]>([])
  const projectData = ref<{ name: string; value: number }[]>([])

  // Actions
  const setTimeRange = async (range: string) => {
    timeRange.value = range
    await fetchAllData()
  }

  const fetchAllData = async () => {
    loading.value = true
    try {
      await Promise.all([
        fetchLineChartData(),
        fetchStatsData(),
        fetchConsumeData(),
        fetchProjectData(),
      ])
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const fetchLineChartData = async () => {
    const [incomeData, netIncomeData] = await Promise.all([
      apiFetchIncomeLineChartData(timeRange.value),
      apiFetchNetIncomeLineChartData(timeRange.value),
    ])
    lineChartData.value.xData = incomeData.values.map((item) => item.label)
    lineChartData.value.income = incomeData.values.map((item) => item.value)
    lineChartData.value.netIncome = netIncomeData.values.map((item) => item.value)
    // console.log('incomeData:', incomeData)
    // console.log('netIncomeData:', netIncomeData)
  }

  const fetchStatsData = async () => {
    const data = await apiFetchStatsData(timeRange.value)

    statsData.value.totalIncome = data.totalIncome
    statsData.value.netIncome = data.netIncome
    statsData.value.totalExpense = data.totalExpense
    // console.log('📊 统计数据:', statsData.value)
  }

  const fetchConsumeData = async () => {
    const data = await apiFetchConsumeData(timeRange.value)
    // console.log('📊 消费数据:', data)
    consumeData.value = data.map((item) => ({ name: item.type, value: item.amount }))
    // console.log('🍵 饼图数据:', consumeData.value)
  }

  const fetchProjectData = async () => {
    const data = await apiFetchProjectData(timeRange.value)
    projectData.value = data.map((item) => ({ name: item.project, value: item.amount }))
    // console.log('🛠️ 项目收入数据:', projectData.value)
  }

  return {
    timeRange,
    loading,
    error,
    lineChartData,
    statsData,
    consumeData,
    projectData,
    setTimeRange,
    fetchAllData,
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchStaffSalaries as apiFetchStaffSalaries,
  fetchStaffIncomeTrend as apiFetchStaffIncomeTrend,
} from '@/api/modules/staff'

// 定义接口确保类型安全
interface StaffSalary {
  staff_id: number
  staff_name: string
  total_salary: number
  year_salary: number
  month_salary: number
  week_salary: number
}

export const useStaffStatsStore = defineStore('staffStats', () => {
  // 状态定义
  const timeRange = ref('week') // 'week', 'month', 'quarter', 'year'
  const loading = ref(false)
  const error = ref<unknown>(null)

  // 员工薪水数据
  const staffSalaries = ref<StaffSalary[]>([])

  // 员工带来收益趋势与对比数据
  const chartData = ref<(string | number)[][]>([])

  // 根据timeRange的员工总带来收益数据
  const incomeData = ref({})

  // 方法
  const setTimeRange = (range: string) => {
    timeRange.value = range
    fetchAllData()
  }

  function calcIncomeData(source: (string | number)[][]) {
    if (!Array.isArray(source) || source.length < 2) return []
    // source[0] 是表头，source[1...] 是员工数据
    return source.slice(1).map((row) => {
      const name = row[0] as string
      // 指定 sum: number，初始值 0
      const total = row.slice(1).reduce((sum: number, v) => sum + Number(v), 0)
      return { name, value: total }
    })
  }

  const fetchAllData = async () => {
    loading.value = true
    try {
      await Promise.all([fetchStaffSalaries(), fetchStaffIncomeTrend(timeRange.value)])
    } catch (err) {
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const fetchStaffSalaries = async () => {
    try {
      const data = await apiFetchStaffSalaries()
      // console.log('获取员工带来收益数据:', data)
      staffSalaries.value = Array.isArray(data) ? data : []
      // console.log('员工带来收益数据:', staffSalaries.value)
    } catch (err) {
      error.value = err
      console.error('获取员工带来收益失败:', err)
    }
  }

  const fetchStaffIncomeTrend = async (period: string) => {
    try {
      const res = await apiFetchStaffIncomeTrend(period)
      // console.log('获取员工收入趋势数据:', res)
      chartData.value = res.source || []
      // console.log('员工收入趋势数据:', chartData.value)
      incomeData.value = calcIncomeData(chartData.value)
      // console.log('incomeData:', incomeData.value)
    } catch (err) {
      error.value = err
      console.error('获取员工收入趋势失败:', err)
    }
  }

  return {
    timeRange,
    loading,
    error,
    staffSalaries,
    chartData,
    incomeData,
    setTimeRange,
    fetchAllData,
  }
})

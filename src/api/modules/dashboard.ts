import { apiRequest } from '../request'

// 根据period获取商店总收入，净收入，总支出
export interface StatsSummary {
  totalIncome: number
  netIncome: number
  totalExpense: number
}

export const fetchStatsData = (range: string) =>
  apiRequest<StatsSummary>({
    url: '/stats/summary',
    method: 'get',
    params: { period: range },
  })

// 根据period获取会员和普通会员的消费数据
export interface ConsumeDataItem {
  type: string
  amount: number
}

export const fetchConsumeData = (range: string) =>
  apiRequest<ConsumeDataItem[]>({
    url: '/stats/consumption-ratio',
    method: 'get',
    params: { period: range },
  })

// 根据period获取各项目收入数据
export interface ProjectDataItem {
  project: string
  amount: number
}

export const fetchProjectData = (range: string) =>
  apiRequest<ProjectDataItem[]>({
    url: '/stats/project-income-ratio',
    method: 'get',
    params: { period: range },
  })

// 根据period获取折线图数据(总收入，净收入)
export interface LineChartData {
  label: string
  value: number
}
export interface LineChartResponse {
  period: string
  dimension: string
  values: LineChartData[]
}

export const fetchIncomeLineChartData = (range: string) =>
  apiRequest<LineChartResponse>({
    url: '/stats/income-trend',
    method: 'get',
    params: { period: range },
  })

export const fetchNetIncomeLineChartData = (range: string) =>
  apiRequest<LineChartResponse>({
    url: '/stats/net-income-trend',
    method: 'get',
    params: { period: range },
  })

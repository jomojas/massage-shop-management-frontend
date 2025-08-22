import { apiRequest } from '../request'

// 日志记录类型
export interface LogRecord {
  id: number
  module: string
  operation: string
  detail: string
  operation_time: string
}

// 日志分页响应类型
export interface LogResponse {
  totalLogs: number
  totalPages: number
  currentPage: number
  logs: LogRecord[]
}

// 查询操作日志
export const fetchLogs = (filters: Record<string, any> = {}) =>
  apiRequest<{ data: LogResponse }>({
    url: '/logs',
    method: 'get',
    params: filters,
  })

// 获取操作类型和模块类型字典
export interface LogCategoryResponse {
  operationTypes: { value: string; label: string }[]
  moduleTypes: { value: string; label: string }[]
}

export const fetchLogCategories = () =>
  apiRequest<{ data: LogCategoryResponse }>({
    url: '/logs/categories',
    method: 'get',
  })

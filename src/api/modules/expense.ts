import { apiRequest } from '../request'

// 支出记录类型
export interface ExpenseRecord {
  id: number
  category: string
  amount: number
  spendDate: string
  description: string
  isDeleted: number
  createTime: string
  updateTime: string
}

// 新增支出记录
export const addExpense = (data: {
  category: string
  amount: number
  spendDate: string
  description?: string
}) =>
  apiRequest({
    url: '/expenses',
    method: 'post',
    data,
  })

// 修改支出记录
export const updateExpense = (
  id: number | string,
  data: {
    category: string
    amount: number
    spendDate: string
    description?: string
  },
) =>
  apiRequest({
    url: `/expenses/${id}`,
    method: 'put',
    data,
  })

// 查询支出记录（未删除）
export const fetchExpenses = (filters: Record<string, any> = {}) =>
  apiRequest<{
    data: {
      records: ExpenseRecord[]
      totalRecords: number
      totalPages: number
      currentPage: number
    }
  }>({
    url: '/expenses',
    method: 'get',
    params: filters,
  })

// 逻辑删除支出记录
export const deleteExpense = (id: number | string) =>
  apiRequest({
    url: `/expenses/${id}`,
    method: 'delete',
  })

// 逻辑恢复支出记录
export const restoreExpense = (id: number | string) =>
  apiRequest({
    url: `/expenses/restore/${id}`,
    method: 'put',
  })

// 查询已删除支出记录
export const fetchDeletedExpenses = (filters: Record<string, any> = {}) =>
  apiRequest<{
    data: {
      records: ExpenseRecord[]
      totalRecords: number
      totalPages: number
      currentPage: number
    }
  }>({
    url: '/expenses/deleted',
    method: 'get',
    params: filters,
  })

// 获取支出类别字典
export const fetchExpenseCategories = () =>
  apiRequest<{ data: string[] }>({
    url: '/expenses/categories',
    method: 'get',
  })

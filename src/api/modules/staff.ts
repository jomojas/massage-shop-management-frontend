import { apiRequest } from '../request'

// 获取员工薪资
export interface StaffSalary {
  staff_id: number
  staff_name: string
  total_salary: number
  year_salary: number
  month_salary: number
  week_salary: number
}

// 获取所有员工全部、本年、本月、实际所得薪资
export const fetchStaffSalaries = () =>
  apiRequest<StaffSalary[]>({
    url: '/stats/staff-salaries',
    method: 'get',
  })

// 获取员工服务收益变化折线图和对比饼图数据
export interface StaffIncomeTrendResponse {
  source: (string | number)[][]
}

export const fetchStaffIncomeTrend = (period: string) =>
  apiRequest<StaffIncomeTrendResponse>({
    url: '/stats/staff-income-trend',
    method: 'get',
    params: { period },
  })

// 查询未删除员工列表项
export interface StaffListItem {
  id: number
  name: string
  phone: string
  commission: number
  isDeleted: boolean
  createTime: string
  updateTime: string
}

export interface StaffListResponse {
  totalEmployees: number
  totalPages: number
  currentPage: number
  employees: StaffListItem[]
}

export const fetchUndeletedStaffs = (filters: Record<string, any> = {}) =>
  apiRequest<StaffListResponse>({
    url: '/staffs',
    method: 'get',
    params: filters,
  })

// 查询已删除员工列表项
export const fetchDeletedStaffs = (filters: Record<string, any> = {}) =>
  apiRequest<StaffListResponse>({
    url: '/staffs/deleted',
    method: 'get',
    params: filters,
  })

// 增加员工
export interface AddStaffRequest {
  name: string
  phone: string
  commission: number
}

export const addStaff = (data: AddStaffRequest) =>
  apiRequest<true | string>({
    url: '/staffs',
    method: 'post',
    data,
  })

// 编辑（覆盖式修改）员工信息
export interface EditStaffRequest {
  name: string
  phone: string
  commission: number
}

export const editStaff = (id: number, data: EditStaffRequest) =>
  apiRequest<true | string>({
    url: `/staffs/${id}`,
    method: 'put',
    data,
  })

// 逻辑删除员工（软删除）
export const deleteStaff = (id: number) =>
  apiRequest<true | string>({
    url: `/staffs/${id}`,
    method: 'delete',
  })

// 逻辑恢复员工
export const restoreStaff = (id: number) =>
  apiRequest<true | string>({
    url: `/staffs/${id}/restore`,
    method: 'post',
  })

// 获取员工的服务记录
export interface StaffServiceRecord {
  recordId: number
  staffId: number
  staffName: string
  projectName: string
  earnings: number
  customerName: string | null
  customerDesc: string | null
  serviceTime: string
  commission: number
  recordDetail: string
}

export interface StaffServiceRecordsResponse {
  totalRecords: number
  totalPages: number
  currentPage: number
  records: StaffServiceRecord[]
}

export const fetchStaffServiceRecords = (params: Record<string, any> = {}) =>
  apiRequest<StaffServiceRecordsResponse>({
    url: '/staffs/service-records',
    method: 'get',
    params,
  })

// 单个员工本周服务记录（timeline）
export interface StaffWeekServiceRecord {
  serviceTime: string
  project: string
  earnings: number
}

export const fetchStaffWeekServiceRecords = (id: number | string) =>
  apiRequest<StaffWeekServiceRecord[]>({
    url: `/stats/staff-service/${id}`,
    method: 'get',
  })

// 1. 查询员工每日状态列表
export interface StaffStatusRecord {
  recordId: number
  staffId: number
  staffName: string
  phone: string
  status: string
  remark: string
  date: string
}
export interface StaffStatusListResponse {
  totalRecords: number
  totalPages: number
  currentPage: number
  staffStatusRecords: StaffStatusRecord[]
}
export const fetchStaffStatusList = (params: Record<string, any> = {}) =>
  apiRequest<StaffStatusListResponse>({
    url: '/staff-status',
    method: 'get',
    params,
  })

// 2. 获取员工状态字典
export const fetchStaffStatusCategories = () =>
  apiRequest<{ data: string[] }>({
    url: '/staff-status/categories',
    method: 'get',
  })

// 3. 新增员工每日状态
export interface AddStaffStatusRequest {
  date: string
  status: string
  remark?: string
}
export const addStaffStatus = (staffId: number | string, data: AddStaffStatusRequest) =>
  apiRequest({
    url: `/staff-status/${staffId}`,
    method: 'post',
    data,
  })

// 4. 更新员工每日状态
export interface UpdateStaffStatusRequest {
  date: string
  status: string
  remark?: string
}
export const updateStaffStatus = (recordId: number | string, data: UpdateStaffStatusRequest) =>
  apiRequest({
    url: `/staff-status/${recordId}`,
    method: 'put',
    data,
  })

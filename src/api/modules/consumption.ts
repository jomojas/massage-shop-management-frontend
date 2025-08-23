import { apiRequest } from '../request'

// 查询消费记录
export interface ConsumptionProject {
  projectName: string
  price: number
  employees: string[] | { id?: number; name?: string; employeeId?: number; income: number }[]
}
export interface ConsumptionRecord {
  record_id: number
  name: string | null
  phone: string | null
  description: string | null
  totalPrice: number
  consumeTime: string
  projects: ConsumptionProject[]
  recordDetail: string
}
export interface FetchConsumptionsResponse {
  totalConsumes: number
  totalPages: number
  currentPage: number
  consumptions: ConsumptionRecord[]
}
export function fetchConsumptions(params: Record<string, any> = {}) {
  return apiRequest<FetchConsumptionsResponse>({
    url: '/consumptions',
    method: 'get',
    params,
  })
}

// 新增消费记录
export interface AddConsumptionProject {
  projectName: string
  price: number
  employees: { employeeId: number; income: number }[]
}
export interface AddConsumptionRequest {
  memberId?: number
  customerDesc?: string
  projects: AddConsumptionProject[]
  consumeTime: string
  totalPrice: number
  recordDetail?: string
}
export function addConsumption(data: AddConsumptionRequest) {
  return apiRequest<true | string>({
    url: '/consumptions',
    method: 'post',
    data,
  })
}

// 修改消费记录
export interface UpdateConsumptionProject {
  projectName: string
  price: number
  employees: { id?: number; name?: string; employeeId?: number; income: number }[]
}
export interface UpdateConsumptionRequest {
  name?: string
  phone?: string
  description?: string
  totalPrice: number
  consumeTime: string
  projects: UpdateConsumptionProject[]
  recordDetail?: string
}
export function updateConsumption(id: number | string, data: UpdateConsumptionRequest) {
  return apiRequest<true | string>({
    url: `/consumptions/${id}`,
    method: 'put',
    data,
  })
}

import { apiRequest } from '../request'

// 根据参数获取未删除会员信息
export interface Member {
  id: number
  name: string
  phone: string
  balance: number
  description: string
  createdTime: string
}
export interface UndeletedMemberResponse {
  totalMembers: number
  totalPages: number
  currentPage: number
  members: Member[]
}
export const fetchUndeletedMembers = (filters: Record<string, any> = {}) =>
  apiRequest<UndeletedMemberResponse>({
    url: '/members',
    method: 'get',
    params: filters,
  })

// 根据参数获取已删除会员信息
export interface DeletedMemberResponse {
  totalMembers: number
  totalPages: number
  currentPage: number
  members: Member[]
}
export const fetchDeletedMembers = (filters: Record<string, any> = {}) =>
  apiRequest<DeletedMemberResponse>({
    url: '/members/deleted',
    method: 'get',
    params: filters,
  })

// 根据会员id删除会员（软删除）
export const deleteMember = (id: number) =>
  apiRequest<true | string>({
    url: `/members/${id}`,
    method: 'delete',
  })

// 会员充值
export interface RechargeRequest {
  amount: number
  remark?: string
}

export const rechargeMember = (id: number, data: RechargeRequest) =>
  apiRequest<true | string>({
    url: `/members/${id}/recharges`,
    method: 'post',
    data,
  })

// 编辑会员信息
export interface EditMemberRequest {
  name: string
  phone: string
  balance: number
  description: string
}

export const editMember = (id: number, data: EditMemberRequest) =>
  apiRequest<true | string>({
    url: `/members/${id}`,
    method: 'put',
    data,
  })

// 新增会员（首次充值，自动增加充值记录）
export interface AddMemberRequest {
  name: string
  phone: string
  balance: number
  description: string
}

export const addMember = (data: AddMemberRequest) =>
  apiRequest<true | string>({
    url: '/members',
    method: 'post',
    data,
  })

// 恢复已删除会员
export const restoreMember = (id: number) =>
  apiRequest<true | string>({
    url: `/members/${id}/restore`,
    method: 'put',
  })

// 获取充值记录
export interface RechargeRecord {
  id: number
  memberId: number
  memberName: string
  memberPhone: string
  amount: number
  rechargeTime: string
  remark: string
}

export interface RechargeRecordResponse {
  totalRecords: number
  totalPages: number
  currentPage: number
  list: RechargeRecord[]
}

export const fetchRechargeRecords = (filters: Record<string, any> = {}) =>
  apiRequest<RechargeRecordResponse>({
    url: `/members/recharges`,
    method: 'get',
    params: filters,
  })

// 编辑充值记录信息
export interface EditChargeRequest {
  amount: number
  remark?: string
}

export const editCharge = (id: number, data: EditChargeRequest) =>
  apiRequest<true | string>({
    url: `/members/recharges/${id}`,
    method: 'put',
    data,
  })

// 获取某会员本月消费记录
export interface MemberConsumptionRecord {
  consumeDate: string
  project: string
  price: number
}

export const fetchMemberConsumption = (id: number) =>
  apiRequest<MemberConsumptionRecord[]>({
    url: `/stats/member-consumption/${id}`,
    method: 'get',
  })

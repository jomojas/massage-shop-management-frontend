import { apiRequest } from '../request'

// 项目类型
export interface Project {
  id: number
  name: string
  category: string
  priceGuest: number
  priceMember: number
  description: string
  isDeleted: number
  createdTime: string
  updatedTime: string
}

export interface ProjectResponse {
  totalProjects: number
  totalPages: number
  currentPage: number
  projects: Project[]
}

// 查询项目（未删除，带分页、筛选、排序）
export const fetchProjects = (filters: Record<string, any> = {}) =>
  apiRequest<ProjectResponse>({
    url: '/projects',
    method: 'get',
    params: filters,
  })

// 查询已删除项目
export const fetchDeletedProjects = (filters: Record<string, any> = {}) =>
  apiRequest<ProjectResponse>({
    url: '/projects/deleted',
    method: 'get',
    params: filters,
  })

// 新增项目
export interface AddProjectRequest {
  name: string
  category: string
  priceGuest: number
  priceMember: number
  description: string
}

export const addProject = (data: AddProjectRequest) =>
  apiRequest<true | string>({
    url: '/projects',
    method: 'post',
    data,
  })

// 新增项目类别
export const addProjectCategory = (data: { category: string }) =>
  apiRequest<true | string>({
    url: '/projects/categories',
    method: 'post',
    data,
  })

// 修改项目
export interface UpdateProjectRequest {
  name: string
  category: string
  priceGuest: number
  priceMember: number
  description: string
}

export const updateProject = (id: number | string, data: UpdateProjectRequest) =>
  apiRequest<true | string>({
    url: `/projects/${id}`,
    method: 'put',
    data,
  })

// 逻辑删除项目
export const deleteProject = (id: number | string) =>
  apiRequest<true | string>({
    url: `/projects/${id}`,
    method: 'delete',
  })

// 逻辑恢复已删除项目
export const restoreProject = (id: number | string) =>
  apiRequest({
    url: `/projects/${id}/restore`,
    method: 'patch',
  })

// 查询项目类别字典（下拉菜单）
export const fetchProjectCategories = () =>
  apiRequest<string[]>({
    url: '/projects/categories',
    method: 'get',
  })

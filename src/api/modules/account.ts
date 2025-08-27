import { apiRequest } from '../request'

// 退出登录
export const logout = () =>
  apiRequest<string>({
    url: '/account/logout',
    method: 'post',
  })

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) =>
  apiRequest<string>({
    url: '/account/change-password',
    method: 'post',
    data,
  })

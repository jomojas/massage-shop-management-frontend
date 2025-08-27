import { apiRequest } from '../request'

// 账号密码登录
export const loginByAccount = (data: { username: string; password: string }) =>
  apiRequest<{ token: string }>({
    url: '/login/account',
    method: 'post',
    data,
  })

// 获取图形验证码
export const getCaptcha = (phone: string) =>
  apiRequest<string>({
    url: '/login/captcha',
    method: 'get',
    params: { phone },
  })
// 这里 <string> 就是 data 字段的类型，base64 字符串

// 发送短信验证码
export const sendPhoneCode = (data: { phone: string; captcha: string }) =>
  apiRequest<true | string>({
    url: '/login/send-code',
    method: 'post',
    data,
  })

// 验证码登录
export const loginByPhone = (data: { phone: string; code: string }) =>
  apiRequest<{ token: string }>({
    url: '/login/phone',
    method: 'post',
    data,
  })

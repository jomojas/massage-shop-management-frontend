interface Config {
  apiBaseUrl: string
  timeout: number
  env: 'development' | 'production'
}

const config: Config = {
  // 从环境变量读取 API 地址
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? '/api' : 'http://localhost:8080/api'),
  timeout: 15000,
  env: import.meta.env.VITE_APP_ENV || 'development',
}

// // 开发环境下打印配置信息
// if (import.meta.env.DEV) {
//   console.log('🚀 当前环境配置:', {
//     模式: import.meta.env.MODE,
//     是否开发环境: import.meta.env.DEV,
//     是否生产环境: import.meta.env.PROD,
//     API地址: config.apiBaseUrl,
//     环境: config.env,
//   })
// }

export default config

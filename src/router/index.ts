import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard/index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/Members/index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/staff',
    name: 'Staff',
    component: () => import('@/views/Staffs/index.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/views/Projects/index.vue'),
    meta: { requiresAuth: true },
  },
  // 业务管理 - 嵌套路由
  {
    path: '/business',
    name: 'business',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'consumption',
        name: 'consumption',
        component: () => import('@/views/Consumptions/index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'expenses',
        name: 'expenses',
        component: () => import('@/views/Expenses/index.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  // 系统管理 - 嵌套路由
  {
    path: '/system',
    name: 'system',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'logs',
        name: 'logs',
        component: () => import('@/views/Logs/index.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound/index.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// // 路由守卫
// router.beforeEach((to, from, next) => {
//   const token = localStorage.getItem('token')

//   // 需要登录但没有token
//   if (to.meta.requiresAuth && !token) {
//     next('/login')
//     return
//   }

//   // 已登录访问登录页，重定向到首页
//   if (to.path === '/login' && token) {
//     next('/dashboard')
//     return
//   }

//   next()
// })

export default router

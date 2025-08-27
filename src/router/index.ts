import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // 登录页单独路由
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login/index.vue'),
    meta: { requiresAuth: false },
  },
  // 主应用布局
  {
    path: '/',
    component: () => import('@/components/Layout/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard/index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('@/views/Members/index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('@/views/Staffs/index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/Projects/index.vue'),
        meta: { requiresAuth: true },
      },
      // 业务管理
      {
        path: 'business/consumption',
        name: 'consumption',
        component: () => import('@/views/Consumptions/index.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'business/expenses',
        name: 'expenses',
        component: () => import('@/views/Expenses/index.vue'),
        meta: { requiresAuth: true },
      },
      // 系统管理
      {
        path: 'system/logs',
        name: 'logs',
        component: () => import('@/views/Logs/index.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  // 404
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

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth) {
    if (token) {
      next()
    } else {
      next({ path: '/login' })
    }
  } else {
    // 已登录访问登录页时自动跳转到首页
    if (to.path === '/login' && token) {
      next({ path: '/dashboard' })
    } else {
      next()
    }
  }
})

export default router

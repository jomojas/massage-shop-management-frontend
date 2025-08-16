export interface MenuItem {
  path: string
  name: string
  label: string
  icon: string
  url?: string
  children?: MenuItem[]
  meta?: {
    requiresAuth?: boolean
    roles?: string[]
    hidden?: boolean
  }
}

export const menuList: MenuItem[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    label: '首页',
    icon: 'House',
    url: 'Dashboard',
  },
  {
    path: '/members',
    name: 'members',
    label: '会员管理',
    icon: 'User',
    url: 'Members',
  },
  {
    path: '/staff',
    name: 'staff',
    label: '员工管理',
    icon: 'UserFilled',
    url: 'Staffs',
  },
  {
    path: '/projects',
    name: 'projects',
    label: '项目管理',
    icon: 'FolderOpened',
    url: 'Projects',
  },
  {
    path: '/business',
    name: 'business',
    label: '业务管理',
    icon: 'Management',
    children: [
      {
        path: '/business/consumption', // 改为嵌套路径
        name: 'consumption',
        label: '消费记录',
        icon: 'ShoppingCart',
        url: 'Consumptions',
      },
      {
        path: '/business/expenses', // 改为嵌套路径
        name: 'expenses',
        label: '支出管理',
        icon: 'Money',
        url: 'Expenses',
      },
    ],
  },
  {
    path: '/system',
    name: 'system',
    label: '系统管理',
    icon: 'Setting',
    children: [
      {
        path: '/system/logs', // 改为嵌套路径
        name: 'logs',
        label: '日志管理',
        icon: 'Document',
        url: 'Logs',
      },
    ],
  },
]

// 页面标题映射（从菜单配置自动生成）
export const pageTitles: Record<string, string> = {}

// 递归生成页面标题映射
const generatePageTitles = (items: MenuItem[]) => {
  items.forEach((item) => {
    if (item.path && item.label && !item.children) {
      pageTitles[item.path] = item.label
    }
    if (item.children) {
      generatePageTitles(item.children)
    }
  })
}

generatePageTitles(menuList)

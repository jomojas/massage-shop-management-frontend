<script setup>
import { useAppStore } from '@/stores/app'
import { computed, inject, ref, nextTick } from 'vue'
import { Menu, Fold, Sunny, Moon } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { pageTitles } from '@/config/menu'
import { logout, changePassword } from '@/api/modules/account'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const appStore = useAppStore()
const route = useRoute()
const router = useRouter()

const loginType = ref(localStorage.getItem('loginType') || 'account')
const canChangePassword = computed(() => loginType.value === 'account')

const showChangePwdDialog = ref(false)
const changePwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const changePwdFormRef = ref()
// _rule 表示未使用，避免 ESLint 报错
const validateConfirmPassword = (_rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== changePwdForm.value.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}
const changePwdRules = {
  oldPassword: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
  newPassword: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

// 注入来自父组件的响应式数据和函数
const isMobile = inject('isMobile', ref(false))
const toggleMobileSidebar = inject('toggleMobileSidebar', () => {})

const handleCollapse = () => {
  if (isMobile.value) {
    // 移动端：切换侧边栏显示/隐藏
    toggleMobileSidebar()
  } else {
    // 桌面端：切换侧边栏展开/折叠
    appStore.toggleCollapse()
  }
}

const handleLogout = async () => {
  try {
    await logout()
    localStorage.removeItem('token')
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (e) {
    ElMessage.error(e.message || '退出登录失败')
  }
}

// 修改密码按钮事件
const handleChangePassword = () => {
  showChangePwdDialog.value = true
  changePwdForm.value.oldPassword = ''
  changePwdForm.value.newPassword = ''
  nextTick(() => {
    changePwdFormRef.value?.clearValidate?.()
  })
}

const submitChangePassword = async () => {
  changePwdFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await changePassword(changePwdForm.value)
      ElMessage.success('密码修改成功，请重新登录')
      showChangePwdDialog.value = false
      localStorage.removeItem('token')
      router.push('/login')
    } catch (e) {
      // ElMessage.error(e.message || '密码修改失败')
    }
  })
}

const resetChangePwdForm = () => {
  changePwdForm.value.oldPassword = ''
  changePwdForm.value.newPassword = ''
  changePwdForm.value.confirmPassword = ''
  nextTick(() => {
    changePwdFormRef.value?.clearValidate?.()
  })
}

// 菜单图标 - 根据设备类型显示不同图标
const menuIcon = computed(() => {
  if (isMobile.value) {
    return Menu // 移动端始终显示菜单图标
  }
  return appStore.isCollapse ? Menu : Fold // 桌面端根据折叠状态显示
})

// 主题相关 - 使用可写的计算属性
const isDark = computed({
  get: () => appStore.isDark,
  set: (value) => {
    if (value !== appStore.isDark) {
      appStore.toggleTheme()
    }
  },
})

// 当前页面信息
const current = computed(() => {
  const currentPath = route.path
  const title = pageTitles[currentPath]
  if (title) {
    return {
      path: currentPath,
      label: title,
    }
  }
  return null
})
</script>

<template>
  <div class="header">
    <div class="l-content">
      <el-button size="default" @click="handleCollapse">
        <el-icon><component :is="menuIcon" /></el-icon>
      </el-button>
      <el-breadcrumb separator="/" class="bread">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="current" :to="current.path">{{
          current.label
        }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="r-content">
      <!-- 主题切换按钮 -->
      <el-switch
        v-model="isDark"
        size="large"
        inline-prompt
        :active-icon="Moon"
        :inactive-icon="Sunny"
        active-text="暗"
        inactive-text="亮"
        style="margin-right: 16px"
      />
      <el-dropdown trigger="click" placement="bottom-end">
        <span class="el-dropdown-link">
          账号操作
          <el-icon style="margin-left: 4px"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleChangePassword" :disabled="!canChangePassword"
              >修改密码</el-dropdown-item
            >
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>

  <el-dialog
    v-model="showChangePwdDialog"
    title="修改密码"
    width="400px"
    :close-on-click-modal="false"
    @close="resetChangePwdForm"
  >
    <el-form
      :model="changePwdForm"
      :rules="changePwdRules"
      ref="changePwdFormRef"
      label-position="top"
      label-width="80px"
    >
      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="changePwdForm.oldPassword"
          type="password"
          show-password
          placeholder="请输入旧密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="changePwdForm.newPassword"
          type="password"
          show-password
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="changePwdForm.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showChangePwdDialog = false">取消</el-button>
      <el-button type="primary" @click="submitChangePassword">确定</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  font-family: $font-family-heading;

  .l-content {
    display: flex;
    align-items: center;

    .el-button {
      margin: 0 20px 0 20px;
      background-color: var(--header-menu-bg);
      color: var(--header-menu-text);
      transition: background-color 0s ease;

      &:hover {
        background-color: var(--header-menu-hover-bg);
        color: var(--text-primary);
      }

      // 确保图标继承颜色
      .el-icon {
        color: inherit;
      }
    }

    .bread {
      // 外部元素不需要 :deep()，因为它们有 scoped 属性
      .el-breadcrumb__item {
        font-size: $font-size-normal;
        cursor: pointer;
      }

      // 内部元素需要 :deep()，因为它们没有 scoped 属性
      :deep(.el-breadcrumb__inner) {
        color: var(--header-text) !important;
        transition: color 0s ease;

        &:hover {
          color: var(--color-primary) !important;
        }
      }

      :deep(.el-breadcrumb__inner.is-link) {
        color: var(--header-text) !important;

        &:hover {
          color: var(--color-primary) !important;
        }
      }
    }
  }

  .r-content {
    display: flex;
    align-items: center;

    .el-dropdown {
      margin-right: 20px;
      color: var(--header-text);
    }
  }
}
</style>

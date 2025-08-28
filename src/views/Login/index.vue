<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { loginByAccount, loginByPhone, getCaptcha, sendPhoneCode } from '@/api/modules/login'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref<'account' | 'phone'>('account')

const accountForm = reactive({
  username: '',
  password: '',
})
const accountRules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}
const accountFormRef = ref<FormInstance>()

const phoneForm = reactive({
  phone: '',
  code: '',
})
const phoneRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}
const phoneFormRef = ref<FormInstance>()

// 发送验证码相关，点击发送后按钮禁用，60秒后恢复
const codeBtnDisabled = ref(false)
const codeBtnText = ref('发送验证码')

const showCaptchaDialog = ref(false)
const captchaImgUrl = ref('')
const captchaInput = ref('')

watch(activeTab, (val) => {
  // 清空账号密码表单
  accountForm.username = ''
  accountForm.password = ''
  // 清空手机号表单
  phoneForm.phone = ''
  phoneForm.code = ''
  // 清空验证码弹窗
  captchaInput.value = ''
  captchaImgUrl.value = ''
  showCaptchaDialog.value = false

  // 清空表单校验提示
  nextTick(() => {
    accountFormRef.value?.clearValidate?.()
    phoneFormRef.value?.clearValidate?.()
  })
})

function handleAccountLogin() {
  if (!accountFormRef.value) return
  accountFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const res = await loginByAccount({
        username: accountForm.username,
        password: accountForm.password,
      })
      if (res && res.token) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('loginType', 'account')
        // 登录成功后跳转到首页或仪表盘
        router.push('/dashboard')
      }
    } catch (e: any) {
      accountForm.password = ''
      // 这里可以根据后端返回的 message 做提示
      // ElMessage.error(e.message || '登录失败')
    }
  })
}

function handlePhoneLogin() {
  if (!phoneFormRef.value) return
  phoneFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const res = await loginByPhone({
        phone: phoneForm.phone,
        code: phoneForm.code,
      })
      if (res && res.token) {
        localStorage.setItem('token', res.token)
        localStorage.setItem('loginType', 'phone')
        router.push('/dashboard')
      }
    } catch (e: any) {
      phoneForm.code = ''
      // ElMessage.error(e.message || '登录失败')
    }
  })
}

async function handleSendCode() {
  if (!phoneForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  try {
    // 获取 base64 字符串
    const base64 = await getCaptcha(phoneForm.phone)
    captchaImgUrl.value = `data:image/png;base64,${base64}`
    captchaInput.value = ''
    showCaptchaDialog.value = true
  } catch (e: any) {
    // ElMessage.error(e.message || '获取验证码失败')
  }
}

async function refreshCaptcha() {
  if (!phoneForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  try {
    const base64 = await getCaptcha(phoneForm.phone)
    captchaImgUrl.value = `data:image/png;base64,${base64}`
    captchaInput.value = ''
  } catch (e: any) {
    ElMessage.error(e.message || '获取验证码失败')
  }
}

async function handleCaptchaConfirm() {
  if (!phoneForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  if (!captchaInput.value) {
    ElMessage.warning('请输入图片验证码')
    return
  }
  try {
    await sendPhoneCode({
      phone: phoneForm.phone,
      captcha: captchaInput.value,
    })
    ElMessage.success('验证码已发送，请注意查收')
    showCaptchaDialog.value = false
    // 启动倒计时
    codeBtnDisabled.value = true
    let seconds = 60
    codeBtnText.value = `${seconds}s后重试`
    const timer = setInterval(() => {
      seconds--
      codeBtnText.value = `${seconds}s后重试`
      if (seconds <= 0) {
        clearInterval(timer)
        codeBtnDisabled.value = false
        codeBtnText.value = '发送验证码'
      }
    }, 1000)
  } catch (e: any) {
    ElMessage.error(e.message || '发送验证码失败')
    // 失败时刷新验证码
    refreshCaptcha()
  }
}
</script>

<template>
  <div class="login-layout">
    <div class="login-left">
      <img src="/images/login-bg.png" alt="登录插画" />
    </div>
    <div class="login-right">
      <div class="login-box">
        <el-tabs v-model="activeTab" stretch>
          <!-- 账号密码登录 -->
          <el-tab-pane label="账号密码登录" name="account">
            <el-form
              :model="accountForm"
              :rules="accountRules"
              ref="accountFormRef"
              label-width="0"
            >
              <el-form-item prop="username">
                <el-input v-model="accountForm.username" placeholder="请输入账号" />
              </el-form-item>
              <el-form-item prop="password">
                <el-input
                  v-model="accountForm.password"
                  type="password"
                  placeholder="请输入密码"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" style="width: 100%" @click="handleAccountLogin"
                  >登录</el-button
                >
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <!-- 手机号登录 -->
          <el-tab-pane label="手机号登录" name="phone">
            <el-form :model="phoneForm" :rules="phoneRules" ref="phoneFormRef" label-width="0">
              <el-form-item prop="phone">
                <el-input v-model="phoneForm.phone" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item prop="code">
                <el-row :gutter="10" style="width: 100%">
                  <el-col :span="16">
                    <el-input v-model="phoneForm.code" placeholder="请输入验证码" />
                  </el-col>
                  <el-col :span="8">
                    <el-button
                      :disabled="codeBtnDisabled"
                      style="width: 100%"
                      @click="handleSendCode"
                      >{{ codeBtnText }}</el-button
                    >
                  </el-col>
                </el-row>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" style="width: 100%" @click="handlePhoneLogin"
                  >登录</el-button
                >
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <!-- 验证码弹窗 -->
        <el-dialog
          v-model="showCaptchaDialog"
          title="请完成验证码验证"
          width="320px"
          :close-on-click-modal="false"
        >
          <div style="text-align: center">
            <img
              :src="captchaImgUrl"
              @click="refreshCaptcha"
              style="cursor: pointer; user-select: none"
            />
            <el-input
              v-model="captchaInput"
              placeholder="请输入图片验证码"
              style="margin-top: 10px"
            />
            <el-button type="primary" style="margin-top: 10px" @click="handleCaptchaConfirm"
              >确认</el-button
            >
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-layout {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.login-left {
  flex: 0 0 50%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  @media (max-width: 768px) {
    display: none;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
    display: block;
    pointer-events: none;
    user-select: none;
  }
}

.login-right {
  flex: 0 0 50%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  @media (max-width: 768px) {
    flex: 1 1 100vw;
    width: 100vw;
    min-width: 0;
    min-height: 100vh;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
}

/* 登录表单盒子：大屏无卡片，小屏卡片包裹 */
.login-box {
  width: 360px;
  padding: 0;
  background: none;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    background: #fff;
    box-shadow: 0 4px 32px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    width: 94vw;
    max-width: 400px;
    min-width: 0;
    padding: 32px 12px 24px 12px;
    margin: 0 auto;
  }
}

.el-tabs {
  width: 100%;
}
.el-form {
  margin-top: 16px;
}
.el-dialog__body {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>

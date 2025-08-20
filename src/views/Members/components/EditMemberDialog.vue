<script setup>
import { defineProps, defineEmits, ref, inject, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({ modelValue: Boolean, member: Object })
const emit = defineEmits(['update:modelValue'])

const formRef = ref(null)

const rules = {
  name: [{ required: true, message: '姓名是必填项', trigger: 'blur' }],
  phone: [
    { required: true, message: '电话是必填项', trigger: 'blur' },
    { pattern: /^\d+$/, message: '电话必须为数字', trigger: 'blur' },
  ],
  balance: [
    { required: true, message: '充值金额是必填项', trigger: 'blur' },
    { type: 'number', message: '充值金额必须是数字', trigger: 'blur' },
  ],
  description: [{ required: false, message: '描述信息是必填项', trigger: 'blur' }],
}

const formEditMember = reactive({
  name: '',
  phone: '',
  balance: '',
  description: '',
})
watch(
  () => props.member,
  (val) => {
    if (val) {
      Object.assign(formEditMember, val)
    }
  },
  { immediate: true },
)

const resetForm = () => {
  formEditMember.name = ''
  formEditMember.phone = ''
  formEditMember.balance = ''
  formEditMember.description = ''
}
const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}
const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}
const onSubmit = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        await ElMessageBox.confirm(
          '编辑会员信息可能导致余额等数据不一致，是否确定要保存修改？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
        // 用户点击“确定”
        emit('submit', { ...formEditMember })
        resetForm()
        emit('update:modelValue', false)
      } catch (e) {
        // 用户点击“取消”或关闭弹窗
        resetForm()
        emit('update:modelValue', false)
      }
    } else {
      ElMessage({
        message: '请输入正确内容',
        showClose: false,
        type: 'error',
      })
    }
  })
}

const isMobile = inject('isMobile', false)
</script>

<template>
  <el-dialog
    v-model="props.modelValue"
    title="编辑会员信息"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form :model="formEditMember" :rules="rules" ref="formRef">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formEditMember.name" placeholder="输入姓名" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="formEditMember.phone" placeholder="输入电话" />
      </el-form-item>
      <el-form-item label="金额" prop="balance">
        <el-input v-model.number="formEditMember.balance" placeholder="输入金额" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="formEditMember.description" placeholder="输入描述信息" />
      </el-form-item>
      <el-form-item class="buttons">
        <el-button type="primary" @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped></style>

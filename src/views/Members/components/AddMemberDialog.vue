<script setup>
import { defineProps, defineEmits, ref, inject, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)

const rules = {
  name: [{ required: true, message: '姓名是必填项', trigger: 'blur' }],
  phone: [
    { required: true, message: '电话是必填项', trigger: 'blur' },
    { type: 'number', message: '电话必须为数字', trigger: 'blur' },
  ],
  balance: [
    { required: true, message: '充值金额是必填项', trigger: 'blur' },
    { type: 'number', message: '充值金额必须是数字', trigger: 'blur' },
  ],
  description: [{ required: false, message: '描述信息是必填项', trigger: 'blur' }],
}

const formAddMember = reactive({
  name: '',
  phone: '',
  balance: '',
  description: '',
})

const resetForm = () => {
  formAddMember.name = ''
  formAddMember.phone = ''
  formAddMember.balance = ''
  formAddMember.description = ''
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
  formRef.value?.validate((valid) => {
    if (valid) {
      // 将表单数据传递给父组件
      emit('submit', { ...formAddMember })
      resetForm()
      emit('update:modelValue', false)
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
    title="添加会员"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form :model="formAddMember" :rules="rules" ref="formRef">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formAddMember.name" placeholder="输入姓名" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model.number="formAddMember.phone" placeholder="输入电话" />
      </el-form-item>
      <el-form-item label="金额" prop="balance">
        <el-input v-model.number="formAddMember.balance" placeholder="输入金额" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="formAddMember.description" placeholder="输入描述信息" />
      </el-form-item>
      <el-form-item class="buttons">
        <el-button type="primary" @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">添加</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style lang="scss" scoped>
.el-form {
  .radio-groups {
    .sort-options {
      margin-right: 30px;
    }
  }
  :deep(.buttons .el-form-item__content) {
    display: flex;
    justify-content: flex-end;
    gap: 20px;

    .el-button {
      width: 100px;
    }
  }
}
</style>

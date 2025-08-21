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
    { pattern: /^1\d{10}$/, message: '请输入有效手机号', trigger: 'blur' },
  ],
  commission: [
    { required: true, message: '提成比例是必填项', trigger: 'blur' },
    { type: 'number', min: 0, max: 1, message: '提成比例范围为0~1', trigger: 'blur' },
  ],
}

const formAddStaff = reactive({
  name: '',
  phone: '',
  commission: null,
})

const resetForm = () => {
  formAddStaff.name = ''
  formAddStaff.phone = ''
  formAddStaff.commission = null
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
      emit('submit', { ...formAddStaff })
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
    title="添加员工"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form :model="formAddStaff" :rules="rules" ref="formRef">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formAddStaff.name" placeholder="输入姓名" />
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="formAddStaff.phone" placeholder="输入电话" />
      </el-form-item>
      <el-form-item label="提成比例" prop="commission">
        <el-input-number
          v-model="formAddStaff.commission"
          :min="0"
          :max="1"
          :step="0.01"
          :precision="2"
          placeholder="输入0~1之间的小数"
          style="width: 100%"
        />
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

<script setup>
import { defineProps, defineEmits, ref, inject, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  categories: {
    type: Array,
    default: () => [],
  },
})
const emit = defineEmits(['update:modelValue', 'submit'])

const formRef = ref(null)

const rules = {
  category: [{ required: true, message: '请选择支出类别', trigger: 'change' }],
  amount: [
    { required: true, message: '金额是必填项', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额不能为负数', trigger: 'blur' },
  ],
  spendDate: [{ required: true, message: '请选择支出日期', trigger: 'change' }],
}

const formAddExpense = reactive({
  category: '',
  amount: null,
  spendDate: '',
  description: '',
})

const resetForm = () => {
  formAddExpense.category = ''
  formAddExpense.amount = null
  formAddExpense.spendDate = ''
  formAddExpense.description = ''
  if (formRef.value) {
    formRef.value.clearValidate?.()
  }
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
      emit('submit', { ...formAddExpense })
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
    :model-value="props.modelValue"
    title="新增支出记录"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formAddExpense"
      :rules="rules"
      ref="formRef"
      label-position="top"
      :label-width="isMobile ? '100%' : '120px'"
    >
      <el-form-item label="支出类别" prop="category">
        <el-select v-model="formAddExpense.category" placeholder="请选择类别" filterable>
          <el-option v-for="item in props.categories" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="金额" prop="amount">
        <el-input-number
          v-model="formAddExpense.amount"
          :min="0"
          :step="1"
          :precision="2"
          placeholder="输入金额"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="支出日期" prop="spendDate">
        <el-date-picker
          v-model="formAddExpense.spendDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择支出日期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formAddExpense.description"
          type="textarea"
          placeholder="支出描述（可选）"
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

<script setup>
import { defineProps, defineEmits, ref, inject, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue'])

const formRecharge = reactive({
  amount: '',
  remark: '',
})

const formRef = ref(null)

const rules = {
  amount: [
    { required: true, message: '充值金额是必填项', trigger: 'blur' },
    { type: 'number', message: '充值金额必须是数字', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value <= 0) {
          callback(new Error('充值金额必须大于0'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  remark: [{ required: false, message: '描述信息是必填项', trigger: 'blur' }],
}

const resetForm = () => {
  formRecharge.amount = ''
  formRecharge.remark = ''
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
  // 对表单输入信息进行校验
  formRef.value?.validate((valid) => {
    if (valid) {
      // 将用户输入的充值金额和备注信息提交到父组件
      emit('submit', { amount: formRecharge.amount, remark: formRecharge.remark })
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
    title="会员充值"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form :model="formRecharge" :rules="rules" ref="formRef">
      <el-form-item label="充值金额" prop="amount">
        <!-- v-model.number:自动将输入的值转为number类型 -->
        <el-input v-model.number="formRecharge.amount" placeholder="输入充值金额" clearable />
      </el-form-item>
      <el-form-item label="描述信息" prop="remark">
        <el-input v-model="formRecharge.remark" placeholder="输入描述信息" />
      </el-form-item>
      <el-form-item class="buttons">
        <el-button type="primary" @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">充值</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style lang="scss" scoped></style>

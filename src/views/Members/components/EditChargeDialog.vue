<script setup>
import { defineProps, defineEmits, ref, inject, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({ modelValue: Boolean, charge: Object })
const emit = defineEmits(['update:modelValue'])

const formRef = ref(null)

const rules = {
  amount: [
    { required: true, message: '充值金额是必填项', trigger: 'blur' },
    { type: 'number', message: '充值金额必须是数字', trigger: 'blur' },
  ],
  remark: [{ required: false, message: '描述信息', trigger: 'blur' }],
}

const formEditCharge = reactive({
  id: props.charge.id,
  amount: props.charge.amount,
  remark: props.charge.remark,
})

watch(
  () => props.charge,
  (newVal) => {
    if (newVal) {
      Object.assign(formEditCharge, newVal)
    }
  },
)

const resetForm = () => {
  formEditCharge.id = null
  formEditCharge.amount = null
  formEditCharge.remark = null
}
const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}
const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}

const onSubmit = async () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        // ElMessageBox.confirm 返回的是 Promise，所以使用await，确保用户先确认后操作
        await ElMessageBox.confirm(
          '编辑充值信息可能导致会员余额等数据不一致，是否确定要保存修改？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          },
        )
        // 用户点击“确定”
        emit('submit', { ...formEditCharge })
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
    title="编辑充值信息"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formEditCharge"
      :rules="rules"
      ref="formRef"
      label-position="right"
      label-width="80px"
    >
      <el-form-item label="充值金额" prop="amount">
        <el-input v-model.number="formEditCharge.amount" placeholder="输入金额" />
      </el-form-item>
      <el-form-item label="描述信息" prop="remark">
        <el-input v-model="formEditCharge.remark" placeholder="输入描述信息" />
      </el-form-item>
      <el-form-item class="buttons">
        <el-button type="primary" @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">确定</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped></style>

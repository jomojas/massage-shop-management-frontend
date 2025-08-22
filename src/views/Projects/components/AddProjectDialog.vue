<script setup>
import { defineProps, defineEmits, ref, inject, reactive, watch } from 'vue'
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
  name: [{ required: true, message: '项目名称是必填项', trigger: 'blur' }],
  category: [{ required: true, message: '请选择项目类别', trigger: 'change' }],
  priceGuest: [
    { required: true, message: '客人价是必填项', trigger: 'blur' },
    { type: 'number', min: 0, message: '客人价不能为负数', trigger: 'blur' },
  ],
  priceMember: [
    { required: true, message: '会员价是必填项', trigger: 'blur' },
    { type: 'number', min: 0, message: '会员价不能为负数', trigger: 'blur' },
  ],
}

const formAddProject = reactive({
  name: '',
  category: '',
  priceGuest: null,
  priceMember: null,
  description: '',
})

const resetForm = () => {
  formAddProject.name = ''
  formAddProject.category = ''
  formAddProject.priceGuest = null
  formAddProject.priceMember = null
  formAddProject.description = ''
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
      emit('submit', { ...formAddProject })
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
    title="新增项目"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formAddProject"
      :rules="rules"
      ref="formRef"
      label-position="top"
      :label-width="isMobile ? '100%' : '120px'"
    >
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="formAddProject.name" placeholder="输入项目名称" />
      </el-form-item>
      <el-form-item label="项目类别" prop="category">
        <el-select v-model="formAddProject.category" placeholder="请选择类别" filterable>
          <el-option v-for="item in props.categories" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="客人价" prop="priceGuest">
        <el-input-number
          v-model="formAddProject.priceGuest"
          :min="0"
          :step="1"
          :precision="2"
          placeholder="输入客人价"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="会员价" prop="priceMember">
        <el-input-number
          v-model="formAddProject.priceMember"
          :min="0"
          :step="1"
          :precision="2"
          placeholder="输入会员价"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formAddProject.description"
          type="textarea"
          placeholder="项目描述（可选）"
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

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
const emit = defineEmits(['update:modelValue', 'search'])

const formRef = ref(null)

const rules = {}

const formFilter = reactive({
  keyword: '',
  category: '',
  sortBy: 'name',
  order: 'asc',
})

const resetForm = () => {
  formFilter.keyword = ''
  formFilter.category = ''
  formFilter.sortBy = 'name'
  formFilter.order = 'asc'
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
      const filters = { ...formFilter }
      emit('search', filters)
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
    title="筛选项目"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="formFilter"
      :rules="rules"
      ref="formRef"
      label-position="right"
      label-width="80px"
    >
      <el-form-item label="名称/类别">
        <el-input v-model="formFilter.keyword" placeholder="输入项目名称或类别" />
      </el-form-item>
      <el-form-item label="项目类别">
        <el-select v-model="formFilter.category" placeholder="请选择类别" clearable>
          <el-option v-for="item in props.categories" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序依据" class="radio-groups">
        <el-radio-group v-model="formFilter.sortBy" class="sort-options">
          <el-radio-button value="name">名称</el-radio-button>
          <el-radio-button value="price_guest">客人价</el-radio-button>
          <el-radio-button value="price_member">会员价</el-radio-button>
        </el-radio-group>
        <el-radio-group v-model="formFilter.order">
          <el-radio-button value="asc">升序</el-radio-button>
          <el-radio-button value="desc">降序</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item class="buttons">
        <el-button type="primary" @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="onSubmit">查询</el-button>
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

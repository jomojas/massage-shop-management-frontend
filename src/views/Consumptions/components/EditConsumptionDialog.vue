<script setup>
import { defineProps, defineEmits, ref, inject, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchProjects } from '@/api/modules/project'
import { fetchUndeletedStaffs } from '@/api/modules/staff'
import MemberSelectorDialog from './MemberSelectorDialog.vue'
const props = defineProps({
  modelValue: Boolean,
  record: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue', 'submit'])

const showMemberDialog = ref(false)

// 级联选择数据
const cascaderOptions = ref([]) // 项目类型-项目-员工的级联数据

const formRef = ref(null)

const addConsumptionForm = reactive({
  isMember: true, // 是否会员
  selectedMember: {}, // 选中的会员对象
  customerDesc: '', // 普通客户描述
  selectedCascader: [], // cascader 选中的路径数组
  selectedList: [], // 编辑区展示的项目-员工-价格数组
  consumeTime: '', // 消费时间
  recordDetail: '', // 备注
})

// 总金额（自动计算）
const totalPrice = computed(() =>
  addConsumptionForm.selectedList.reduce((sum, item) => sum + (Number(item.price) || 0), 0),
)

// 普通顾客描述推荐
const customerDescSuggestions = [
  '附近村居民',
  '附近小区居民',
  '开发区工厂工人',
  '开发区商户老板',
  '外地务工人员',
  '外地来打工',
  '附近做生意的老板',
  '学生',
  '家庭主妇',
  '退休老人',
  '男性年轻人',
  '女性年轻人',
  '男性中年人',
  '女性中年人',
  '男性老年人',
  '女性老年人',
  '第一次来店',
  '回头客',
  '朋友推荐',
  '附近朋友介绍',
  '身体不适主动上门',
]

const queryCustomerDesc = (queryString, cb) => {
  const results = customerDescSuggestions
    .filter((item) => item.includes(queryString))
    .map((item) => ({ value: item }))
  cb(results)
}

const rules = {
  // 客户类型相关校验
  selectedMember: [
    {
      required: true,
      message: '请选择会员',
      trigger: 'blur',
      // 只有在 isMember 为 true 时校验
      validator: (rule, value, callback) => {
        if (addConsumptionForm.isMember && (!value || !value.name)) {
          callback(new Error('请选择会员'))
        } else {
          callback()
        }
      },
    },
  ],
  customerDesc: [
    {
      required: true,
      message: '请输入客户描述',
      trigger: 'blur',
      // 只有在 isMember 为 false 时校验
      validator: (rule, value, callback) => {
        if (!addConsumptionForm.isMember && !value) {
          callback(new Error('请输入客户描述'))
        } else {
          callback()
        }
      },
    },
  ],
  selectedCascader: [
    { required: true, message: '请选择项目和员工', trigger: 'change', type: 'array' },
  ],
  consumeTime: [{ required: true, message: '请选择消费时间', trigger: 'change' }],
}

// 填充表单数据
function fillFormFromRecord(val) {
  // console.log('fillFormFromRecord', cascaderOptions.value, val)
  if (val && Object.keys(val).length) {
    // console.log('val in fillFormFromRecord', val)
    // 1. 判断是否会员
    const isMember = !!(val.name || val.phone)
    addConsumptionForm.isMember = isMember
    // console.log('isMember', isMember)

    // 2. 会员信息
    addConsumptionForm.selectedMember = isMember ? { name: val.name, phone: val.phone } : {}

    // 3. 客户描述（仅普通客户用）
    addConsumptionForm.customerDesc = isMember ? '' : val.description || ''
    // console.log('customerDesc', addConsumptionForm.customerDesc)

    // 4. 消费时间和备注
    addConsumptionForm.consumeTime = val.consumeTime || ''
    addConsumptionForm.recordDetail = val.recordDetail || ''

    // 5. 项目-员工级联
    const cascaderArr = []
    const listArr = []
    // 遍历 record.projects，找到对应的 cascader 路径和编辑区明细
    if (Array.isArray(val.projects)) {
      val.projects.forEach((project) => {
        if (Array.isArray(project.employees)) {
          // 初始化变量，用于记录找到的项目类别和项目ID
          let foundCategory = ''
          let foundProjectId = ''
          // 遍历 cascaderOptions，查找当前项目属于哪个类别，并获取项目ID
          for (const cat of cascaderOptions.value) {
            // 通过项目名匹配，找到对应的项目节点
            const projectNode = cat.children?.find((p) => p.label === project.projectName)
            if (projectNode) {
              foundCategory = cat.value // 项目类别
              foundProjectId = projectNode.value // 项目ID
              break
            }
          }
          // 遍历当前项目下的所有员工（此处员工是姓名字符串）
          project.employees.forEach((empName) => {
            let employeeName = ''
            let employeeId = ''
            if (foundCategory && foundProjectId) {
              // 再次查找项目节点，确保拿到最新的 children
              const projectNode = cascaderOptions.value
                .find((cat) => cat.value === foundCategory)
                ?.children?.find((p) => p.value === foundProjectId)
              // 通过员工姓名匹配，找到员工节点
              const employeeNode = projectNode?.children?.find((e) => e.label === empName)
              employeeName = employeeNode?.label || empName // 员工名
              employeeId = employeeNode?.value || '' // 员工ID
            }
            // 组装 cascader 选中路径
            cascaderArr.push([foundCategory, foundProjectId, employeeId])
            // 组装编辑区的明细项
            listArr.push({
              projectCategory: foundCategory, // 项目类别
              projectName: project.projectName, // 项目名称
              projectId: foundProjectId, // 项目ID
              employeeName: employeeName, // 员工姓名
              employeeId: employeeId, // 员工ID
              price: project.price, // 价格
              suggestPrice: project.price, // 推荐价格
            })
          })
        }
      })
    }
    addConsumptionForm.selectedCascader = cascaderArr
    addConsumptionForm.selectedList = listArr

    // console.log('最终填充表单数据addConsumption', addConsumptionForm)
  } else {
    resetForm()
  }
}

watch(
  () => props.record,
  (val) => {
    // onMounted中对cascaderOptions赋值了，所以cascaderOptions.value的值是所有projects和employees的选项
    if (cascaderOptions.value.length && val && Object.keys(val).length) {
      fillFormFromRecord(val)
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => cascaderOptions.value,
  (options) => {
    if (options.length && props.record && Object.keys(props.record).length) {
      fillFormFromRecord(props.record)
    }
  },
  { immediate: true, deep: true },
)

// 选择选项的时候，更新 selectedList，同步更新编辑区
watch(
  () => addConsumptionForm.selectedCascader,
  (newVal) => {
    // newVal 是一个二维数组，每个 path 形如 [category, projectId, employeeId]
    const newList = []
    newVal.forEach((path) => {
      const [category, projectId, employeeId] = path
      // 找到项目和员工的详细信息
      const categoryNode = cascaderOptions.value.find((c) => c.value === category)
      const projectNode = categoryNode?.children?.find((p) => p.value === projectId)
      const employeeNode = projectNode?.children?.find((e) => e.value === employeeId)
      const project = projectNode?.project
      const employee = employeeNode?.employee

      // 推荐价格
      const suggestPrice = addConsumptionForm.isMember ? project?.priceMember : project?.priceGuest

      // 检查是否已存在，避免重复
      if (
        !newList.some(
          (item) =>
            item.projectCategory === category &&
            item.projectId === projectId &&
            item.employeeId === employeeId,
        )
      ) {
        newList.push({
          projectCategory: category,
          projectName: project?.name || '',
          projectId,
          employeeName: employee?.name || '',
          employeeId,
          price: suggestPrice || 0,
          suggestPrice: suggestPrice || 0,
        })
      }
    })
    addConsumptionForm.selectedList = newList
  },
  { immediate: true, deep: true },
)

function resetForm() {
  addConsumptionForm.isMember = true
  addConsumptionForm.selectedMember = {}
  addConsumptionForm.customerDesc = ''
  addConsumptionForm.selectedCascader = []
  addConsumptionForm.selectedList = []
  addConsumptionForm.consumeTime = ''
  addConsumptionForm.recordDetail = ''
  if (formRef.value) {
    formRef.value.clearValidate?.()
  }
}

function handleMemberSelect(member) {
  addConsumptionForm.selectedMember = member
  showMemberDialog.value = false
}

const handleShowMemberDialog = () => {
  showMemberDialog.value = true
}

const handleCancel = () => {
  resetForm()
  emit('update:modelValue', false)
}
const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}
const onMemberTypeChange = () => {
  const isMember = addConsumptionForm.isMember
  resetForm()
  addConsumptionForm.isMember = isMember
}

const onConfirm = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return

    await ElMessageBox.confirm('确定要提交本次消费记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).catch(() => {
      return
    })

    const submitData = {
      name: addConsumptionForm.selectedMember?.name,
      phone: addConsumptionForm.selectedMember?.phone,
      description: addConsumptionForm.customerDesc,
      totalPrice: totalPrice.value,
      consumeTime: addConsumptionForm.consumeTime,
      recordDetail: addConsumptionForm.recordDetail,
      projects: addConsumptionForm.selectedList.map((item) => ({
        projectName: item.projectName,
        price: Number(item.price),
        employees: [
          {
            id: item.employeeId,
            income: Number(item.price),
            name: item.employeeName,
          },
        ],
      })),
    }
    // console.log('提交数据', submitData)

    emit('submit', submitData)
    resetForm()
    emit('update:modelValue', false)
  })
}

const isMobile = inject('isMobile', false)

function itemKey(item) {
  // 保证唯一性，建议用类别-项目ID-员工ID
  return `${item.projectCategory}-${item.projectId}-${item.employeeId}`
}

// 组装 cascaderOptions，给级联下拉框填充数据
onMounted(async () => {
  // 获取所有项目和员工
  const [projectRes, staffRes] = await Promise.all([
    fetchProjects({ page: 1, pageSize: 9999 }), // 拉全量
    fetchUndeletedStaffs({ page: 1, pageSize: 9999 }),
  ])
  const projects = projectRes.projects || []
  const employees = staffRes.employees || []

  // 1. 按项目类别分组
  const categoryMap = {}
  projects.forEach((project) => {
    if (!categoryMap[project.category]) {
      categoryMap[project.category] = []
    }
    categoryMap[project.category].push(project)
  })

  // 2. 组装 cascaderOptions
  cascaderOptions.value = Object.entries(categoryMap).map(([category, projectList]) => ({
    label: category,
    value: category,
    children: projectList.map((project) => ({
      label: project.name,
      value: project.id,
      // 这里可以带上项目价格等信息
      project: project, // 可选：带上原始项目信息
      children: employees.map((emp) => ({
        label: emp.name,
        value: emp.id,
        employee: emp, // 可选：带上原始员工信息
      })),
    })),
  }))
})
</script>

<template>
  <el-dialog
    :model-value="props.modelValue"
    title="新增消费记录"
    :width="isMobile ? '90%' : '40%'"
    :before-close="handleClose"
  >
    <el-form
      :model="addConsumptionForm"
      label-width="90px"
      label-position="top"
      ref="formRef"
      :rules="rules"
    >
      <!-- 选择客户类型 -->
      <el-form-item label="客户类型">
        <el-radio-group v-model="addConsumptionForm.isMember" @change="onMemberTypeChange">
          <el-radio :label="true">会员</el-radio>
          <el-radio :label="false">普通客户</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 会员选择 -->
      <el-form-item v-if="addConsumptionForm.isMember" label="会员" prop="selectedMember">
        <el-input
          v-model="addConsumptionForm.selectedMember.name"
          placeholder="请选择会员"
          readonly
          @click="handleShowMemberDialog"
        />
        <MemberSelectorDialog v-model="showMemberDialog" @select="handleMemberSelect" />
      </el-form-item>

      <!-- 普通客户描述 -->
      <el-form-item v-else label="客户描述" prop="customerDesc">
        <el-autocomplete
          v-model="addConsumptionForm.customerDesc"
          :fetch-suggestions="queryCustomerDesc"
          placeholder="请输入客户描述"
          :trigger-on-focus="true"
          clearable
        />
      </el-form-item>

      <!-- 项目-员工选择 -->
      <el-form-item label="选择项目/员工" prop="selectedCascader">
        <el-cascader
          v-model="addConsumptionForm.selectedCascader"
          :options="cascaderOptions"
          :props="{ multiple: true, checkStrictly: false }"
          placeholder="请选择项目类型/项目/员工"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 编辑区 -->
      <div v-if="addConsumptionForm.selectedList.length" class="edit-area">
        <div
          v-for="(item, idx) in addConsumptionForm.selectedList"
          :key="itemKey(item)"
          class="edit-item"
          style="display: flex; align-items: center; margin-bottom: 8px"
        >
          <span style="flex: 1">
            {{ item.projectCategory }} / {{ item.projectName }} / {{ item.employeeName }}
          </span>
          <el-input-number
            v-model="item.price"
            :min="0"
            :step="1"
            :precision="2"
            style="width: 150px; margin: 0 10px"
          />
        </div>
      </div>

      <!-- 消费时间 -->
      <el-form-item label="消费时间" prop="consumeTime">
        <el-date-picker
          v-model="addConsumptionForm.consumeTime"
          type="datetime"
          value-format="YYYY-MM-DDTHH:mm:ss"
          placeholder="请选择消费时间"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注" class="remark">
        <el-input
          v-model="addConsumptionForm.recordDetail"
          type="textarea"
          placeholder="请输入备注"
          :rows="2"
        />
      </el-form-item>

      <!-- 总价区域 -->
      <el-form-item label="总金额">
        <el-statistic :value="totalPrice" title="本次消费总额" />
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item style="text-align: right">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="onConfirm">确定</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style lang="scss" scoped>
.edit-area {
  margin-bottom: 16px;
  background: var(--consume-management-bg);
  color: var(--consume-management-text);
  border-radius: 6px;
  padding: 12px 8px;
  border: 1px solid #ebeef5;
}
.el-form-item {
  margin-bottom: 10px;
}
.el-dialog__body {
  padding-top: 10px;
  padding-bottom: 10px;
}
.remark {
  :deep(.el-textarea__inner) {
    color: var(--consume-management-text);
    background-color: var(--consume-management-bg);
  }
}
.el-statistic {
  :deep(.el-statistic__head) {
    font-size: $font-size-small;
    color: var(--dashcard-text) !important;
  }
  :deep(.el-statistic__number) {
    font-size: $font-size-large;
    color: var(--dashcard-text) !important;
  }
}
</style>

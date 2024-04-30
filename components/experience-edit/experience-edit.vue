<script setup lang="ts">
  import dayjs from "dayjs";
  import {
    reactive,
    ref,
    watch,
  } from "vue";
  type DataProp = Array < {
    id: string;company: string;position: string;beginDate: string;endDate: string;desc: string;
  } > ;
  const props = defineProps < {
    data: DataProp
  } > ()
  const emit = defineEmits < {
    (event: 'ok', value: DataProp): void;
  } > ()
  const initObj: Record < string, string > = {};
  props.data.forEach(item => {
    const id = item.id;
    initObj[`${id}_company`] = item.company;
    initObj[`${id}_beginDate`] = item.beginDate;
    initObj[`${id}_endDate`] = item.endDate;
    initObj[`${id}_desc`] = item.desc;
    initObj[`${id}_position`] = item.position;
  })

  const formModel = ref < any > (initObj)
  const formRef = ref();


  const dynamicLists = ref(props.data.map(item => item.id))

  const ruleCompany = [{
    'required': true,
    errorMessage: '请输入工作单位名称'
  }]
  const rulePosition = [{
    'required': true,
    errorMessage: '请输入岗位名称'
  }]
  const ruleBegin = [{
    'required': true,
    errorMessage: '请选择开始时间'
  }]
  const ruleEnd = [{
    'required': true,
    errorMessage: '请选择结束时间'
  }]


  const handleDel = (id: string) => {
    dynamicLists.value = dynamicLists.value.filter(itemId => itemId !== id)
  }

  const handleAdd = () => {
    dynamicLists.value.push(String(Date.now()))
  }

  const handleSubmit = () => {

    formRef.value.validate().then(async (values) => {

      const data = dynamicLists.value.map(id => {
        return {
          id,
          company: formModel.value[`${id}_company`],
          position: formModel.value[`${id}_position`],
          beginDate: dayjs(formModel.value[`${id}_beginDate`]).format('YYYY-MM-DD'),
          endDate: dayjs(formModel.value[`${id}_endDate`]).format('YYYY-MM-DD'),
          desc: formModel.value[`${id}_desc`],
        }
      });
      emit('ok', data)
    }).catch(err => console.log('err'))
  }
</script>

<template>
  <view class="exp-container">
    <uni-forms ref="formRef" :modelValue="formModel" :label-width="110">
      <!-- 动态表单校验 -->
      <view class="exp-block" v-for="(id, index) in dynamicLists" :key="id">
        <view class="exp-header">
          <view class="exp-name">工作经验{{index+1}}</view>
          <button plain class="delete-btn" @click="handleDel(id)">删除</button>
        </view>
        <uni-forms-item label="工作单位名称" required :name="`${id}_company`" :rules="ruleCompany">
          <uni-easyinput v-model="formModel[`${id}_company`]" placeholder="请输入工作单位名称" />
        </uni-forms-item>
        <uni-forms-item label="岗位" required :name="`${id}_position`" :rules="rulePosition">
          <uni-easyinput v-model="formModel[`${id}_position`]" placeholder="请输入岗位名称" />
        </uni-forms-item>
        <uni-forms-item label="开始时间" required :name="`${id}_beginDate`" :rules="ruleBegin">
          <uni-datetime-picker type="date" return-type="date" v-model="formModel[`${id}_beginDate`]" />
        </uni-forms-item>
        <uni-forms-item label="结束时间" required :name="`${id}_endDate`" :rules="ruleEnd">
          <uni-datetime-picker type="date" return-type="date" v-model="formModel[`${id}_endDate`]" />
        </uni-forms-item>
        <uni-forms-item label="工作描述" :name="`${id}_desc`">
          <uni-easyinput type="textarea" v-model="formModel[`${id}_desc`]" placeholder="请输入工作描述"></uni-easyinput>
        </uni-forms-item>
      </view>

      <button class="save-btn" @click="handleSubmit">保存</button>
      <button plain class="add-btn" @click="handleAdd">增加工作经历</button>

    </uni-forms>
  </view>
</template>

<style scoped>
  .exp-container {
    padding: 10px;
    background-color: #fff;
    z-index: 1;
  }

  .exp-block {
    border: 1px solid #c5c5c5;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;
    padding: 10px;
  }

  .uni-forms-item__label {
    flex: 0.5;
  }

  .exp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f1f3ff;
    padding: 0 10px;
    margin: -10px -10px 10px;
  }

  .exp-name {
    flex: 1;
    font-size: 12px;
  }

  .save-btn {
    width: 100%;
    margin-top: 20px;
    height: 40px;
    line-height: 40px;
    color: #fff;
    text-align: center;
    font-size: 14px;
    background-color: #3f75ef;
  }



  .add-btn {
    background-color: transparent;
    border-width: 0;
    color: #3f75ef;
    font-size: 14px;
  }

  .delete-btn {
    color: #3f75ef;
    font-size: 12px;
    background-color: transparent;
    border-width: 0;
  }
</style>

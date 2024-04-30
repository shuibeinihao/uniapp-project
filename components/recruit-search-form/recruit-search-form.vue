<template>
  <view class="container">
    <view class="search-bar-item">
      <uni-datetime-picker type="date" :clear-icon="false" v-model="formModel.recruitmentDate" @change="onChange" />
    </view>
    <view class="search-bar-item">
      <uni-data-select
        v-model="formModel.recruitmentState"
        :localdata="labelData?.enterprise_post_info_job_state"
        placeholder="招聘状态"
        @change="onChange"
      ></uni-data-select>
    </view>
    <view class="filter-btn" @click="onFilter">
      <view class="btn">筛选</view>
      <image class="icon" src="/static/filter.png"></image>
    </view>
  </view>
  <uni-popup ref="popupRef" type="right" background-color="#fff" @change="change">
    <view class="popup-content">
      <view class="popup-content-form">
        <uni-forms v-model="formModel" label-width="80px">
          <uni-forms-item label="类型" name="postType">
            <uni-data-select v-model="formModel.postType" :localdata="labelData?.enterprise_post_info_post_type"
                placeholder="请选择类型"></uni-data-select>
            <!-- <uni-datetime-picker v-model="formModel.contactTime_between" type="daterange" :clear-icon="false" /> -->
          </uni-forms-item>
          <uni-forms-item label="企业简称" name="enterpriseId">
            <uni-data-select v-model="formModel.enterpriseId" :localdata="companyState.data"
                placeholder="请选择企业简称"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="工种" name="workType">
            <uni-data-select v-model="formModel.workType" :localdata="labelData?.enterprise_post_info_work_type"
                placeholder="请选择工种"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="报价" name="offerPrice">
            <uni-data-select v-model="formModel.offerPrice" :localdata="labelData?.enterprise_post_info_offer_price"
                placeholder="请选择报价"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="岗位亮点" name="postLight">
            <uni-data-select v-model="formModel.postLight" :localdata="labelData?.enterprise_post_info_post_light"
                placeholder="请选择岗位亮点"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="入职材料" name="inductionDetail">
            <uni-data-select v-model="formModel.inductionDetail" :localdata="labelData?.enterprise_post_info_induction_detail"
                placeholder="请选择岗位亮点"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="住" name="live">
            <uni-data-select v-model="formModel.live" :localdata="labelData?.enterprise_post_info_live"
                placeholder="请选择住"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="吃" name="eat">
            <uni-data-select v-model="formModel.eat" :localdata="labelData?.enterprise_post_info_eat"
                placeholder="请选择吃"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="作业环境" name="operationEnv">
            <uni-data-select v-model="formModel.operationEnv" :localdata="labelData?.enterprise_post_info_operation_env"
                placeholder="请选择作业环境"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="着装" name="clothing">
            <uni-data-select v-model="formModel.clothing" :localdata="labelData?.enterprise_post_info_clothing"
                placeholder="请选择着装"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="作业姿态" name="operationPose">
            <uni-data-select v-model="formModel.operationPose" :localdata="labelData?.enterprise_post_info_operation_pose"
                placeholder="请选择作业姿态"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="排班" name="rostering">
            <uni-data-select v-model="formModel.rostering" :localdata="labelData?.enterprise_post_info_rostering"
                placeholder="请选择排班"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="户籍/民族" name="nation">
            <uni-data-select v-model="formModel.nation" :localdata="labelData?.enterprise_post_info_nation"
                placeholder="请选择户籍/民族"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="纹身" name="tattoo">
            <uni-data-select v-model="formModel.tattoo" :localdata="labelData?.enterprise_post_info_tattoo"
                placeholder="请选择纹身"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="学历" name="education">
            <uni-data-select v-model="formModel.education" :localdata="labelData?.enterprise_post_info_education"
                placeholder="请选择学历"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="保险方案" name="insuranceScheme">
            <uni-data-select v-model="formModel.insuranceScheme" :localdata="labelData?.enterprise_post_info_insurance_scheme"
                placeholder="请选择保险方案"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="体检" name="bodyTest">
            <uni-data-select v-model="formModel.bodyTest" :localdata="labelData?.enterprise_post_info_body_test"
                placeholder="请选择体检"></uni-data-select>
          </uni-forms-item>
        </uni-forms>
      </view>
      <view class="popup-content-footer">
        <button class="info plain" @click="handleReset">重置</button>
        <button class="primary" @click="handleSearch">查询</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import dayjs from 'dayjs';
import { useRequest } from '../../utils/hooks';

const { labelData } = defineProps<{
  labelData?: Record<string, Array<{ name: string; key: string }>>;
}>()

const emit = defineEmits < {
    (event: 'search', value: any): void;
  } > ()

const { state: companyState } = useRequest<any>({
  url: '/goods/enterprise/listAll',
  method: 'get',
  formatted: (res: any) => {
    if (Array.isArray(res.rows)) {
      const result = res.rows?.map((item: any) => {
        item.text = item.abbreviationName;
        item.value = item.enterpriseId;
        return item;
      });
      result.unshift({
        text: '?',
        value: ''
      });
      return result;
    }
    return [];
  }
})

const formModel = ref({
  recruitmentDate: dayjs().format('YYYY-MM-DD')
});

const popupRef = ref();

const onFilter = () => {
  popupRef.value?.open();
}

const handleReset = () => {
  formModel.value = {};
}

const onChange = (value: string) => {
  nextTick(() => {
    handleSearch();
  })
}

const handleSearch = () => {
  const params = { ...formModel.value } as Record<string, any>;
  emit('search', params);
  popupRef.value?.close();
}
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  position: relative;
  padding-right: 100rpx;
  white-space: nowrap;
  .search-bar-item {
    flex: 1;
    margin-right: 10px;
  }
  .filter-btn {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    padding-right: 12rpx;
    font-size: 28rpx;
    color: #747685;
    background-color: #fff;
    z-index: 2;
    .btn {
      position: relative;
      height: 90rpx;
      line-height: 90rpx;
      padding-left: 12rpx;
      background-color: #fff;
      z-index: 2;
    }
    .icon {
      margin-left: 6rpx;
      width: 28rpx;
      height: 28rpx;
    }
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10rpx;
      bottom: 10rpx;
      width: 1px;
      // background-color: #ebeef5;
      box-shadow: -2rpx 0 10rpx 0 #333;
      z-index: 1;
    }
  }
}
</style>
<style lang="scss">
.popup-content {
  position: relative;
  width: 90vw;
  height: 100vh;
  padding: 20rpx;
  box-sizing: border-box;
  background-color: #fff;
  &-form {
    height: calc(100vh - 132rpx);
    overflow-y: auto;
    .range {
      display: flex;
      align-items: center;
      .sep {
        padding: 0 10rpx;
      }
    }
  }
  &-footer {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 20rpx;
    background-color: #fff;
    box-sizing: border-box;
    z-index: 90;
    box-shadow: 0 -2rpx 10rpx 0 rgba(0, 0, 0, 0.1);
    button {
      display: inline-block;
      width: calc(50% - 16rpx);
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border-radius: 40rpx;
      background-color: #f7f8fa;
      &::after {
        border: none;
      }
      &.primary {
        background-color: #2979ff;
        color: #fff;
      }
      &.plain.info {
        color: #999;
        border-color: 2rpx solid #999;
      }
      & + button {
        margin-left: 20rpx;
      }
    }
  }
}
</style>

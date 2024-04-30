<template>
  <view class="container">
    <view class="search-bar-item">
      <uni-datetime-picker type="date" :clear-icon="false" v-model="formModel.commentDate" @change="onChange" />
    </view>
    <view class="search-bar-item">
      <uni-data-select
        v-model="formModel.processState"
        :localdata="labelData?.comment_info_process_state"
        placeholder="处理状态"
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
          <uni-forms-item label="企业简称" name="enterpriseId">
            <uni-data-select v-model="formModel.enterpriseId" :localdata="companyState.data"
                placeholder="请选择企业简称"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="姓名" name="customerName">
            <uni-easyinput type="text" v-model="formModel.customerName" placeholder="请输入姓名" />
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
  commentDate: ''
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

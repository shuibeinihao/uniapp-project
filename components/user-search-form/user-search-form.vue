<template>
  <view class="container">
    <view class="search-bar-item">
      <uni-easyinput type="text" v-model="formModel.customerName" placeholder="请输入姓名" @confirm="onChange" />
    </view>
    <view class="search-bar-item" style="flex: 1.5">
      <view class="range">
        <uni-easyinput type="number" v-model="formModel.startNotContactTime" placeholder="未联时间" @confirm="onChange" />
        <view class="sep">-</view>
        <uni-easyinput type="number" v-model="formModel.endNotContactTime" placeholder="未联时间" @confirm="onChange" />
      </view>
    </view>
    <!-- <view class="search-bar-item">
      <uni-data-select
        v-model="formModel.sourceType"
        :localdata="labelData?.customer_info_source_type"
        placeholder="来源"
        @change="onChange"
      ></uni-data-select>
    </view>
    <view class="search-bar-item">
      <uni-data-select
        v-model="formModel.identity"
        :localdata="labelData?.customer_info_identity"
        placeholder="用户身份"
        @change="onChange"
      ></uni-data-select>
    </view>
    <view class="search-bar-item">
      <uni-data-select
        v-model="formModel.type"
        :localdata="labelData?.customer_info_type"
        placeholder="分类"
        @change="onChange"
      ></uni-data-select>
    </view> -->
    <view class="filter-btn" @click="onFilter">
      <view class="btn">筛选</view>
      <image class="icon" src="/static/filter.png"></image>
    </view>
  </view>
  <uni-popup ref="popupRef" type="right" background-color="#fff" @change="change">
    <view class="popup-content">
      <view class="popup-content-form">
        <uni-forms v-model="formModel" label-width="75px">
          <uni-forms-item label="注册时间" name="createTime_between">
            <uni-datetime-picker v-model="formModel.createTime_between" type="daterange" :clear-icon="false" />
          </uni-forms-item>
          <uni-forms-item label="沟通时间" name="contactTime_between">
            <uni-datetime-picker v-model="formModel.contactTime_between" type="daterange" :clear-icon="false" />
          </uni-forms-item>
          <uni-forms-item label="未联时间" name="notContactTime_between">
            <view class="range">
              <uni-easyinput type="number" v-model="formModel.startNotContactTime" placeholder="最小值" />
              <view class="sep">-</view>
              <uni-easyinput type="number" v-model="formModel.endNotContactTime" placeholder="最大值" />
            </view>
          </uni-forms-item>
          <uni-forms-item label="推广人" name="referrerId">
            <uni-easyinput type="text" v-model="formModel.referrerId" placeholder="请输入推广人" />
          </uni-forms-item>
          <uni-forms-item label="就业方向" name="title">
            <uni-data-select v-model="formModel.title" :localdata="labelData?.customer_info_title"
                placeholder="请选择就业方向"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="拨号情况" name="dialState">
            <uni-data-select v-model="formModel.dialState" :localdata="labelData?.customer_info_dial_state"
                placeholder="请选择拨号情况"></uni-data-select>
          </uni-forms-item>
          <!-- <uni-forms-item label="经纪人" name="agentId">
            <uni-data-select v-model="formModel.agentId" :localdata="agentData.data"
                placeholder="请选择经纪人"></uni-data-select>
          </uni-forms-item> -->
          <uni-forms-item label="性别" name="sex">
            <uni-data-select v-model="formModel.sex" :localdata="sexArr"
                placeholder="请选择性别"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="年龄" name="age">
            <view class="range">
              <uni-easyinput type="number" v-model="formModel.startAge" placeholder="最小值" />
              <view class="sep">-</view>
              <uni-easyinput type="number" v-model="formModel.endAge" placeholder="最大值" />
            </view>
          </uni-forms-item>
          <uni-forms-item label="民族" name="nation">
            <uni-data-select v-model="formModel.nation" :localdata="labelData?.customer_info_nation"
                placeholder="请选择民族"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="纹身情况" name="tattoo">
            <uni-data-select v-model="formModel.tattoo" :localdata="labelData?.customer_info_tattoo"
                placeholder="请选择纹身情况"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="学历" name="education">
            <uni-data-select v-model="formModel.education" :localdata="labelData?.customer_info_education"
                placeholder="请选择学历"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="姓名" name="customerName">
            <uni-easyinput type="text" v-model="formModel.customerName" placeholder="请输入姓名" />
          </uni-forms-item>
          <uni-forms-item label="手机号" name="phoneNumber">
            <uni-easyinput type="text" v-model="formModel.phoneNumber" placeholder="请输入手机号" />
          </uni-forms-item>
          <uni-forms-item label="身份证号" name="idCard">
            <uni-easyinput type="text" v-model="formModel.idCard" placeholder="请输入身份证号" />
          </uni-forms-item>
          <uni-forms-item label="户籍" name="address">
            <uni-easyinput type="text" v-model="formModel.address" placeholder="请输入户籍" />
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
import { useRequest } from '../../utils/hooks';

const { labelData } = defineProps<{
  labelData?: Record<string, Array<{ name: string; key: string }>>;
}>()

const emit = defineEmits < {
    (event: 'search', value: any): void;
  } > ()

const sexArr = ref([{
  text: '男',
  value: 'M'
}, {
  text: '女',
  value: 'F'
}])

// const { state: agentData } = useRequest<any>({
//   url: '/queryAgent',
//   formatted: (res: any) => {
//     const data : Record<string, Array<{
//       key : string; name : string;
//     }>> = {}
//     if (Array.isArray(res)) {
//       return res.map((item: any) => {
//         item.text = item.agentName;
//         item.value = item.agentId;
//         return item;
//       });
//     }
//     return [];
//   }
// })

const formModel = ref({});

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
  if (params.createTime_between) {
    params.startCreateTime = params.createTime_between[0];
    params.endCreateTime = params.createTime_between[1];
  }
  if (params.contactTime_between) {
    params.startContactTime = params.contactTime_between[0];
    params.endContactTime = params.contactTime_between[1];
  }
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
    .range {
      display: flex;
      align-items: center;
      .sep {
        padding: 0 10rpx;
      }
    }
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

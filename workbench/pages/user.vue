<template>
  <view class="container">
    <view class="search-bar">
      <user-search-form
        :labelData="labelState.data"
        @search="searchChange"
      />
    </view>
    <view v-if="state.data?.rows.length > 0" class="user-list-item" v-for="item in state.data?.rows" :key="item.enterpriseId"
      @click="()=> handleRouteUser(item)">
      <!-- <view class="user-name">
        <text class="identity" :class="'identity-' + item.identity">{{ item.identityName }}</text>
        <text class="name">{{ item.nickName || '?' }}</text> ｜
        <text class="name">{{ item.phoneNumber || '?' }}</text> ｜
        <text class="name">{{ item.contactTime ? dayjs(item.contactTime).fromNow(true) : '暂无' }}</text> ｜
        <text class="name">{{ item.dialStateName || '?' }}</text> ｜
        <text class="name">{{ item.titleName || '?' }}</text>
      </view> -->
      <view class="head">
        <text>注册时间：{{ dayjs(item.createTime).format('YYYY/MM/DD HH:mm') }}</text>
        <text>沟通日期：{{ item.contactTime ? dayjs(item.contactTime).format('YYYY/MM/DD') : '暂无' }}</text>
      </view>
      <view class="info">
        <uni-row>
          <uni-col :span="8"><text class="list-item-content-label">身份：</text>{{ item.identityName }}</uni-col>
          <uni-col :span="8"><text class="list-item-content-label">昵称：</text>{{ item.nickName || '?' }}</uni-col>
          <uni-col :span="8">{{ item.phoneNumber || '?' }}</uni-col>
        </uni-row>
        <uni-row>
          <uni-col :span="8"><text class="list-item-content-label">未联：</text>{{ item.contactTime ? dayjs().diff(dayjs(item.contactTime), 'days') + '天' : '暂无' }}</uni-col>
          <uni-col :span="8"><text class="list-item-content-label">拨号情况：</text>{{ item.dialStateName || '?' }}</uni-col>
          <uni-col :span="8"><text class="list-item-content-label">就业方向：</text>{{ item.titleName || '?' }}</uni-col>
        </uni-row>
        <uni-row>
          <uni-col :span="8"><text class="list-item-content-label">姓名：</text><text :class="{name: !!item.customerName}">{{ item.customerName || '?' }}</text></uni-col>
          <uni-col :span="8"><text class="list-item-content-label">性别：</text>{{ getRowsName(item.sex, sexArr) || '?' }}</uni-col>
          <uni-col :span="8"><text class="list-item-content-label">年龄：</text>{{ getUserAge(item.idCard) || '?' }}岁</uni-col>
        </uni-row>
        <uni-row>
          <uni-col :span="8"><text class="list-item-content-label">民族：</text>{{ item.nationName  || '?' }}</uni-col>
          <uni-col :span="8"><text class="list-item-content-label">纹身：</text>{{ item.tattooName || '?' }}</uni-col>
          <uni-col :span="8"><text class="list-item-content-label">学历：</text>{{ item.educationName || '?' }}</uni-col>
        </uni-row>
        <view class="list-item-content space-between" v-if="item.sex || item.idCard || item.nationName">
          <!-- <text>{{ item.customerName }} | {{ getRowsName(item.sex, sexArr) }} | {{ getUserAge(item.idCard) }}岁 | {{ item.nationName || '?' }} | {{ item.tattooName || '?' }} | {{ item.educationName || '?' }}</text> -->
          <!-- <view class="phone" @click.stop="callPhone(item.phoneNumber)">{{ item.phoneNumber }}
            <uni-icons type="phone-filled" size="12" color="#2979ff"></uni-icons>
          </view> -->
        </view>
        <!-- <view class="list-item-content" v-if="item.address"><text class="list-item-content-label">户籍地址：</text>{{ item.address }}</view> -->
        <view class="list-item-content" v-if="item.remark"><text class="list-item-content-label">备注：</text>{{ item.remark }}</view>
        <!-- <view class="list-item-content space-between">
          <text><text class="list-item-content-label">注册来源：</text>{{ item.sourceTypeName }}</text>
          <text><text class="list-item-content-label">推广人：</text>{{ item.referrerName || '公司' }}/{{ item.referrerIdentityName || '公司' }}</text>
        </view> -->
      </view>
      <button v-if="item.uniId" class="btn" @click.stop="rowSend(item)">发消息</button>
    </view>
    <view class="pagination">
      <el-pagination :current="state.data?.current" ：showPageSize="true" :total="state.data?.total" @change="currentChange" />
      <view class="pagination-total">
        <text>当前页：{{ state.data?.current }}</text>
        <text>数据总量：{{ state.data?.total }}条</text>
        <text>每页数据：{{ 10 }}</text>
      </view>
    </view>
    <view v-if="state.loading" class="list-status">正在加载中。。。</view>
    <!-- <view v-else-if="!state.hasMore" class="list-status">没有更多了~</view> -->
    <user-info-edit
      v-if="action.showType=== 'userInfoEdit'"
      :labelState="labelState.data"
      :data="action.data"
      @ok="handleUserInfoOk"
      @close="onClose"
    ></user-info-edit>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import dayjs from 'dayjs';
import { sexArr } from '@/constants';
import { getRowsName, getUserAge } from '@/utils';
import { useListRequest, useRequest } from '@/utils/hooks';

const {state, run } = useRequest({
  url: '/mobile/queryCustomerInfoPage',
  method: 'get',
  params: {
    pageNum: 1,
    pageSize: 10,
    validUser: '1',
  }
})

const searchChange = (params: any) => {
  run({...params, pageNum: 1});
}

const currentChange = ({current}) => {
  run({ pageNum: current })
}

const { state: labelState } = useRequest({
  url: '/system/dict/data/listAll',
  method: 'get',
  formatted: (res : any) => {
    const data : Record<string, Array<{
      value : string; text : string;
    }>> = {}
    if (Array.isArray(res)) {
      res.forEach((item : any) => {
        const key = `${item.dictType}`
        if (!data[key]) {
          data[key] = [{ value: item.dictValue, text: item.dictLabel }]
        } else {
          data[key].push({ value: item.dictValue, text: item.dictLabel})
        }
      })
    }
    return data;
  }
});

const callPhone = (phone: string) => {
  uni.makePhoneCall({
    phoneNumber: phone
  })
}

const handleRouteUser = (item: Customer.Detail) => {
  uni.navigateTo({
    url: `/workbench/pages/user-detail?customerId=${item.customerId}`
  })
}

const action = ref<{
  showType ? : string;data ? : any;
}> ({});

const rowEdit = (item: Customer.Detail) => {
  action.value = {
    showType: 'userInfoEdit',
    data: item
  }
}

const rowSend = (item: Customer.Detail) => {
  if (!item.uniId) {
    uni.showToast({ title: '暂无IM账号', icon: 'none' });
    return;
  }
  uni.navigateTo({url: `/uni_modules/uni-im/pages/chat/chat?user_id=${item.uniId}` })
}

uni.$on('user:reload', () => {
  run();
});

const handleUserInfoOk = (data: any) => {
  action.value = {}
  run()
}
const onClose = () => {
  action.value = {};
}
</script>

<style lang="scss" scoped>
.container {
  padding: 110rpx 24rpx 200rpx;
  .search-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    padding: 12rpx 24rpx;
    z-index: 10;
    background-color: #fff;
    box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.05);
  }
  .user-list-item {
    position: relative;
    padding: 24rpx;
    line-height: 1.5;
    font-size: 28rpx;
    color: #303133;
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.05);
    .head {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16rpx;
      font-size: 26rpx;
    }
    .user-name {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      .identity {
        margin-right: 12rpx;
        padding: 0 6rpx;
        font-size: 24rpx;
        color: #fff;
        border-radius: 4rpx;
        background-color: #4598F3;
        &.identity-2 {
          background-color: #F3A459;
        }
        &.identity-3 {
          background-color: #F34545;
        }
      }
      .name {
        color: #333;
        font-weight: 500;
      }
    }
    .name {
      padding: 0 4px;
      background-color: #2979ff;
      border-radius: 4rpx;
      color: #fff;
    }
    .list-item-content {
      padding: 6rpx 0;
      &-label {
        color: #606266;
        display: none;
      }
      &.space-between {
        display: flex;
        justify-content: space-between;
      }
    }
    .btn {
      position: absolute;
      bottom: 12rpx;
      right: 24rpx;
      height: 48rpx;
      line-height: 48rpx;
      font-size: 24rpx;
      color: #fff;
      border-radius: 64rpx;
      background-color: #2979ff;
    }
    // .btns {
    //   margin-top: 24rpx;
    //   padding: 12rpx 0 0;
    //   border-top: 1rpx solid #E4E7ED;
    //   text-align: right;
    //   .btn {
    //     display: inline-block;
    //     padding: 0 32rpx;
    //     font-size: 24rpx;
    //     color: #fff;
    //     border-radius: 64rpx;
    //     background-color: #2979ff;
    //     &::after {
    //       border: none;
    //     }
    //   }
    // }
    & + .user-list-item {
      margin-top: 24rpx;
    }
  }
  .list-status {
    font-size: 12px;
    text-align: center;
    padding: 5px;
  }
  .pagination {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 32rpx 24rpx;
    background-color: #fff;
    border-top: 2rpx solid #eeeeee;
    z-index: 9;
    &-btns {
      display: flex;
      align-items: center;
      color: #666;
    }
    &_btn {
      display: flex;
      padding: 0 8px;
      line-height: 30px;
      font-size: 12px;
      position: relative;
      background-color: #F0F0F0;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      text-align: center;
      border-radius: 5px;
      &--disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }
    &-page {
      flex: 1;
      padding: 0 12rpx;
    }
    &-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 16rpx;
      font-size: 28rpx;
      color: #303133;
    }
  }
}
</style>
<style>
page {
  background-color: #f7f8fa;
}
</style>

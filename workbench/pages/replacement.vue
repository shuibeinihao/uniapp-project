<template>
  <view class="container">
    <view class="search-bar">
      <placement-search-form
        :labelData="labelData.data"
        @search="searchChange"
      />
    </view>
    <view class="total">总共：{{ state.total }} 条结果</view>
    <view class="replacement-item-list">
      <navigator class="replacement-item" v-for="item in state.rows" :key="item.id" :url="'/workbench/pages/replacement-detail?id=' + item.id">
        <view class="replacement-item-title">
          <text class="post-type" :class="`post-type-${item.positionType}`">{{ getRowsName(item.positionType, labelData?.data?.enterprise_post_info_post_type) }}</text>
          <!-- <text class="name">{{ item.customerName }}</text> -->
          <text style="margin-right: 24rpx;">{{ item.enterpriseSimpleName }}</text>
          <text style="margin-right: 24rpx;">{{ getRowsName(item.workType, labelData?.data?.enterprise_post_info_work_type) }}</text>
          <text style="margin-right: 24rpx;">{{ getRowsName(item.offerPrice, labelData?.data?.enterprise_post_info_offer_price) }}</text>
          <!-- <text class="sex" :class="`sex-${item.sex}`">{{ getRowsName(item.sex, sexArr) }}</text> -->
          <!-- <text>{{ getUserAge(item.idCard) }}岁</text> -->
          <!-- <text v-if="!item.interviewState && item.signState" class="sign state">{{ getRowsName(item.signState, signStatusArr) }}</text>
          <text v-if="!item.entryState && item.interviewState" class="interview state">{{ getRowsName(item.interviewState, interviewStatusArr) }}</text>
          <text v-if="!item.departState && item.entryState" class="entry state">{{ getRowsName(item.entryState, entryStatusArr) }}</text>
          <text v-if="item.departState" class="depart state">{{ getRowsName(item.departState, departStatusArr) }}</text> -->
        </view>
        <view class="replacement-item-content">
          <uni-row>
            <uni-col :span="6"><text class="name">{{ item.customerName }}</text></uni-col>
            <uni-col :span="6"><text class="sex" :class="`sex-${item.sex}`">{{ getRowsName(item.sex, sexArr) }}</text></uni-col>
            <uni-col :span="6">{{ getUserAge(item.idCard) }}岁</uni-col>
            <uni-col :span="6">{{ getRowsName(item.nation, labelData.data?.customer_info_nation) }}</uni-col>
          </uni-row>
          <view style="margin-top: 10rpx;"></view>
          <uni-row>
            <uni-col :span="24">{{ item.birthAddress }}</uni-col>
          </uni-row>
          <view style="margin-top: 10rpx;"></view>
          <uni-row>
            <uni-col :span="6">{{ getRowsName(item.gatherPoint, labelData?.data?.enterprise_post_info_gather_point) || "?" }}</uni-col>
            <uni-col :span="18">{{ item.signPosition }}</uni-col>
          </uni-row>
        </view>
        <view class="replacement-item-btns">
          <button :class="{active: item.signState === 'P'}" @click.stop="handleAction('sign', item)">{{ item.signState ? getRowsName(item.signState, signStatusArr) : '签到'}}</button>
          <!-- <button v-if="!['C', 'R'].includes(item.signState) && item.interviewState !== 'P'" @click.stop="handleAction('interview', item)">面试</button> -->
          <button :class="{active: item.interviewState === 'P'}" @click.stop="handleAction('interview', item)">{{ item.interviewState ? getRowsName(item.interviewState, interviewStatusArr) : '面试'}}</button>
          <button :class="{active: item.entryState === 'P'}" @click.stop="handleAction('entry', item)">{{ item.entryState ? getRowsName(item.entryState, entryStatusArr) : '入职'}}</button>
          <button :class="{active: ['3', '4'].includes(item.departState)}" @click.stop="handleAction('depart', item)">{{item.departState ? getRowsName(item.departState, departStatusArr) : '在离职'}}</button>
        </view>
      </navigator>
    </view>
    <view v-if="state.loading" class="list-status">正在加载中。。。</view>
    <view v-else-if="!state.hasMore" class="list-status">没有更多了~</view>
    <placement-sign-modal
      v-if="action.showType === 'signShow'"
      :data="action.data"
      @close="action = {}"
      @ok="handleActionModalOk"
    />
    <placement-interview-modal
      v-if="action.showType === 'interviewShow'"
      :data="action.data"
      @close="action = {}"
      @ok="handleActionModalOk"
    />
    <placement-entry-modal
      v-if="action.showType === 'entryShow'"
      :data="action.data"
      @close="action = {}"
      @ok="handleActionModalOk"
    />
    <placement-depart-modal
      v-if="action.showType === 'departShow'"
      :data="action.data"
      @close="action = {}"
      @ok="handleActionModalOk"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useListRequest, useRequest } from '@/utils/hooks';
import { sexArr, departStatusArr, entryStatusArr, interviewStatusArr, signStatusArr } from '@/constants';
import { getRowsName, getUserAge } from '@/utils';

const { state, loadStart } = useListRequest({
  url: '/placement/position/list',
  method: 'get',
  defaultParams: {
    orderByColumn: "signTime",
    isAsc: "desc",
  },
  manual: true,
})

const query = ref({});

const searchChange = (params: any) => {
  query.value = params;
  loadStart(params)
}

const { state: labelData } = useRequest({
  url: '/system/dict/data/listAll',
  method: 'get',
  formatted: (res : any) => {
    const data : Record<string, Array<{
      key : string; name : string; value: string; text: string;
    }>> = {}
    if (Array.isArray(res)) {
      res.forEach((item : any) => {
        const key = `${item.dictType}`
        if (!data[key]) {
          data[key] = [{
            key: '_isEmpty',
            value: '_isEmpty',
            name: '?',
            text: '?'
          }]
        }
        data[key].push({ key: item.dictValue, value: item.dictValue, text: item.dictLabel, name: item.dictLabel})
      })
    }
    return data;
  }
});

const makePhoneCall = (phone : string) => {
  if (!phone) {
    return;
  }
  uni.makePhoneCall({
    phoneNumber: phone
  })
}

const action = ref<{
  showType ? : string;data ? : any;
}> ({});

const handleAction = (type : string, data : any) => {
  action.value = {
    showType: `${type}Show`,
    data
  }
}

const handleActionModalOk = () => {
  action.value = {};
  loadStart(query.value);
}

uni.$on('placement:reload', () => {
  loadStart(query.value);
});

</script>

<style>
page {
  background-color: #f7f8fa;
}
</style>
<style lang="scss" scoped>
.container {
  padding: 100rpx 24rpx 24rpx;
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
  .total {
    padding: 12rpx 0;
    color: #2979ff;
    font-size: 28rpx;
    text-align: right;
  }
  .replacement-item {
    position: relative;
    padding: 24rpx;
    background-color: #fff;
    border-radius: 16rpx;

    .post-type {
      display: inline-block;
      margin-right: 12rpx;
      padding: 0 8rpx;
      font-size: 22rpx;
      color: #fff;
      border-radius: 4rpx;
      &-1 {
        background-color: #2979ff;
      }
      &-2 {
        background-color: #EF5340;
      }
    }

    &-title {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      font-size: 28rpx;
      color: #303133;
      .name {
        margin-right: 12rpx;
        font-size: 30rpx;
        font-weight: 500;
      }
      .sex {
        margin-right: 12rpx;
        color: #4ea6f3;
        &-F {
          color: #eb50c4;
        }
      }
      .state {
        position: absolute;
        right: 0;
        top: 16rpx;
        padding: 6rpx 24rpx;
        border-radius: 24rpx 0 0 24rpx;
        background-color: rgba(41, 121, 255, 0.1);
        &.entry {
          color: #3cbd8c;
          background-color: rgba(60, 189, 140, 0.1);
        }
        &.depart {
          color: #ef5340;
          background-color: rgba(239, 83, 64, 0.1);
        }
        &.interview {
          color: #f7b500;
          background-color: rgba(247, 181, 0, 0.1);
        }
        &.sign {
          color: #2979ff;
        }
      }
    }
    &-content {
      line-height: 1.5;
      font-size: 26rpx;
      color: #1a1a1a;
      .uni-row {
        margin-bottom: 12rpx;
        .uni-col {
          color: #909399;
        }
      }
    }
    &-btns {
      margin-top: 16rpx;
      padding-top: 16rpx;
      border-top: 1px solid #ebeef5;
      text-align: right;
      button {
        display: inline-block;
        padding: 0 32rpx;
        // height: 56rpx;
        line-height: 56rpx;
        font-size: 26rpx;
        color: #ef5340;
        border: 1rpx solid #ef5340;
        border-radius: 30rpx;
        background-color: transparent;
        box-sizing: border-box;
        &:not(:last-child) {
          margin-right: 16rpx;
        }
        &::after {
          border: none;
        }
        &.active {
          background-color: #2979ff;
          color: #fff;
          border-color: #2979ff;
        }
      }
    }

    & + .replacement-item {
      margin-top: 16rpx;
    }
  }
  .list-status {
    font-size: 12px;
    text-align: center;
    padding: 5px;
  }
}
</style>

<template>
  <view class="page">
    <view v-if="state.data?.rows?.length > 0" class="list">
      <view v-for="item in state?.data?.rows" :key="item.recruitmentId" class="list-item" @click="()=> handleRoutePost(item)">
        <view class="list-item-content-line">反馈日期：{{ item.commentTime }}</view>
        <view class="list-item-header">
          <text class="list-item-title">{{item.enterpriseSimpleName}}</text>
        </view>
        <view class="list-item-gaps">
          <text class="list-item-gap" v-if="item.positionType">{{item.positionTypeName}}</text>
          <text class="list-item-gap" v-if="item.workType">{{item.workTypeName}}</text>
          <text class="list-item-gap-last" v-if="item.offerPrice">{{item.offerPriceName}}</text>
        </view>
        <!-- <view class="list-item-content">
          <view class="list-item-content-line">问题类型：{{ item.commentTypeName }}</view>
          <view class="list-item-content-line">诉求：{{item.comment}}</view>
        </view> -->
        <view class="list-item-status">
          <uni-tag v-if="item.processState === '0'" :text="item.processStateName" inverted type="warning" />
          <uni-tag v-if="item.processState === '1'" :text="item.processStateName" type="primary" />
          <uni-tag v-if="item.processState === '2'" :text="item.processStateName" type="success" />
        </view>
      </view>
    </view>
    <data-empty v-else text="还没有反馈信息"></data-empty>
    <view class="footer">
      <button class="feedback" @click="handleFeedback">反馈问题</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import app from "../../utils/application";
import { useRequest } from "../../utils/hooks";
import { formatRichText } from '@/utils/index'

onLoad(() => {
  app.getUserInfo().then(data => {
    run({ customerId: data.customerId });
  });
});

uni.$on('feedback:reload', () => {
  app.getUserInfo().then(data => {
    run({ customerId: data.customerId });
  });
});

const { state, run } = useRequest({
  url: '/placement/comment/list',
  method: 'get',
  manual: true,
  params: {}
});

const handleRoutePost = (item) => {
  let url = `/pages/user/feedback?id=${item.commentId}&positionId=${item.positionId}`;
  uni.navigateTo({ url });
}

const handleFeedback = () => {
  uni.navigateTo({
    url: `/pages/user/feedback`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background-color: #f5f5f5;
  .list {
    position: relative;
    padding: 24rpx;
    &-item {
      position: relative;
      margin-bottom: 10px;
      padding: 10px;
      font-size: 12px;
      color: #333;
      line-height: 1.5;
      border-radius: 10rpx;
      box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.05);
      background-color: #fff;
      &-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }
      .list-item-title {
        font-size: 14px;
        font-weight: bold;
        margin-right: 10px;
      }
      .list-item-gaps {
        position: relative;
        line-height: 1.2;
      }

      .list-item-gap {
        padding: 0 10px;
        border-right: 1px solid #ccc;
      }

      .list-item-gap-last {
        margin-left: 10px;
      }
      .list-item-status {
        position: absolute;
        top: 24rpx;
        right: 24rpx;
      }
    }
  }
  .footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 16rpx 32rpx 32rpx;
    box-sizing: border-box;
    background-color: #fff;
    box-shadow: -2rpx 0 10rpx 0 rgba(51, 51, 51, 0.3);
    z-index: 9;
    .feedback {
      height: 40px;
      line-height: 40px;
      border-radius: 5px;
      padding: 0 15px;
      text-align: center;
      font-size: 14px;
      background-color: #feb800;
      color: #fff;
    }
  }
}
</style>

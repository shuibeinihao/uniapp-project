<template>
  <view class="container">
    <uni-list :border="false">
      <uni-list-item v-for="item in state.data" :key="item.noticeId" :title="item.noticeTitle"
        :note="item.noticeContent"
       :rightText="formateDateTime(item.createTime, 'YYYY/MM/DD')"></uni-list-item>
    </uni-list>
    <view v-if="state.loading" class="list-status">正在加载中。。。</view>
    <view v-else-if="!state.hasMore" class="list-status">没有更多了~</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {  useRequest } from '../../utils/hooks';
import { formateDateTime } from '../../utils';
import { onLoad } from '@dcloudio/uni-app';

const {state } = useRequest({
  url: '/mobile/queryNotice',
  params: {
    status: 'E',
  }
});

onLoad((options: any) => {
});
</script>

<style lang="scss" scoped>
.container {
  padding: 24rpx;
  line-height: 1.5;
  font-size: 28rpx;
  color: #303133;
  .list-status {
    padding: 5px;
    font-size: 12px;
    text-align: center;
  }
}
</style>

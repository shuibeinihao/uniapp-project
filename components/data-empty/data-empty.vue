<script setup lang="ts">
  const props = defineProps < {
    text: string;
  } > ()
</script>

<template>
  <view class="empty">
    <image src="/static/empty.png" ></image>
    <view class="text">{{props.text}}</view>
  </view>
</template>

<style scoped>
  .empty {
    text-align: center;
    padding: 30rpx;
  }

  .text {
    color: #333;
    font-size: 14px;
    margin-top: 20rpx;
  }
</style>

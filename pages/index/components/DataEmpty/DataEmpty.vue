<script setup lang="ts">



const props = defineProps<{
    text: string;
}>()

</script>

<template>
  <view class="empty">
    <image class="img" src="/static/empty.png" />
    <view class="text">{{props.text}}</view>
  </view>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: 30rpx;
}
.img {
	width: 194px;
	height: 172px;
}
.text {
  color: #333;
  font-size: 14px;
  margin-top: 20rpx;
}
</style>
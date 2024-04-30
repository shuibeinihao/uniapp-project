<script setup lang="ts">
  const props = defineProps < {
    title: string;
    style ? : any;
    fixed ? : boolean;
    horizontal ? : boolean;
  } > ()

  const handleBack = () => {
    uni.navigateBack()
  }
</script>

<template>
  <view :class="{'custom-navigation-bar': true, 'fixed': props.fixed, 'horizontal': props.horizontal} " :style="props.style">
    <view class="back" @click="handleBack">
      <uni-icons type="back" size="24"></uni-icons>
    </view>
    <view class="title">{{props.title}}</view>
  </view>
</template>

<style scoped lang="scss">
  .custom-navigation-bar {
    position: relative;
    background-color: #f8f8f8;
    padding-top: 20px;
    height: 65px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    box-sizing: border-box;
    &.fixed {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
    }
    
    &.fixed.horizontal {
      transform: rotate(-90deg) translate(-100vh, 0);
      transform-origin: left top; 
      padding-top: 0;
      height: 45px;
      width: 100vh;
    }

    .back {
      position: absolute;
      left: 0px;
      width: 45px;
      height: 45px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .title {
      font-size: 15px;
      font-weight: bold;
    }
  }
</style>

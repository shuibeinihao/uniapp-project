<script setup lang="ts">
  import {
    ref
  } from "vue";
  import {
    onLoad,
  } from "@dcloudio/uni-app";
  import app from "../../utils/application";
  const userInfo = ref < any > ({})

  onLoad(() => {

    app.getUserInfo().then(data => {
      userInfo.value = data;
    })
  })
</script>

<template>
  <view class="page">
    <!-- <view class="block mt-10">
      <view>
        <view>账户与安全</view>
        <view class="subtitle">修改密码，设置支付密码等</view>
      </view>
      <view>
        <image class="right-img" src="/static/right-gray.png"></image>
      </view>
    </view> -->
    <view class="block mt-10">
      <view>
        实名认证
      </view>
      <view class="right-content none-right">
        {{userInfo.customerName}}
      </view>
    </view>
    <view class="block mt-2">
      <view>
        绑定手机号
      </view>
      <view class="right-content">
        <text>{{userInfo.phoneNumber || '未绑定'}}</text>
        <image class="right-img" src="/static/right-gray.png"></image>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .page {
    min-height: 100vh;
    background-color: #f2f2f2;
    overflow: auto;
  }

  .block {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    padding: 14px 14px;
    font-size: 16px;
    color: #333;
    position: relative;
  }

  .mt-10 {
    margin-top: 10px;
  }

  .mt-2 {
    margin-top: 2px;
  }

  .subtitle {
    font-size: 14px;
    color: #707070;
  }

  .right-img {
    width: 15px;
    height: 15px;
    margin-left: 8px;
  }

  .none-right {
    padding-right: 23px;
  }

  .right-content {
    font-size: 14px;
    color: #707070;
    display: flex;
    align-items: center;
  }


  .logout-btn {
    margin: 20px;
    height: 40px;
    line-height: 40px;
    background-color: #fff;
    color: $uni-primary;
    border-radius: 8px;
    text-align: center;
    font-size: 16px;
  }
</style>

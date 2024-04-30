<template>
  <view class="contact-modal">
    <view class="body">
      <button class="btn-phone" @click="handleContactByPhone">
        <uni-icons class="icon" type="phone" color="#fff" size="22"></uni-icons>
        拨打电话
      </button>
      <!-- #ifndef MP-KUAISHOU -->
      <button class="btn-online" @click="handleContactOnline">
        <uni-icons class="icon" type="chatboxes" color="#fff"></uni-icons>
        在线咨询
      </button>
      <!-- #endif -->
    </view>
    <view style="margin-top: 10px; text-align: center;" @click="emit('close')">
      <uni-icons type="close" color="#fff" size="32"></uni-icons>
    </view>
  </view>
</template>

<script setup lang="ts">
import app from '@/utils/application';

const handleContactByPhone = () => {
  app.getUserInfo().then(res => {
    uni.makePhoneCall({
      phoneNumber: res.agentPhone || '400 880 1090',
    })
  });
  emit('close')
}

const handleContactOnline = () => {
  const userRoleInfo = uni.getStorageSync('userRoleInfo');
  app.getUserInfo().then(res => {
    if (!res.agentUid) {
      uni.showToast({ title: '暂无在线客服', icon: 'none' });
      return;
    }
    let url = `/uni_modules/uni-im/pages/chat/chat?user_id=${res.agentUid}`;
    if (userRoleInfo === '1') {
      url = `/uni_modules/uni-im/pages/index/index`;
    }
    uni.navigateTo({ url })
  });
  emit('close')
}

const emit = defineEmits<{
  (event : 'close') : void;
}>()

</script>

<style lang="scss" scoped>
.contact-modal {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  touch-action: none;
  z-index: 100;
  background-color: rgba(0, 0, 0, .4);
  overflow: auto;
  .body {
    margin: calc(50vh - 124rpx) auto 0 auto;
    width: 300px;
    padding: 32rpx;
    max-width: 90vw;
    min-height: 100px;
    background-color: #fff;
    border-radius: 9px;
    box-sizing: border-box;
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      .icon {
        margin-right: 8rpx;
        line-height: 1;
      }
      &::after {
        border: none;
      }
    }
    .btn-phone {
      background-color: #2979ff;
      color: #fff;
    }
    .btn-online {
      margin-top: 24rpx;
      background-color: #1aad19;
      color: #fff;
    }
  }
}
</style>

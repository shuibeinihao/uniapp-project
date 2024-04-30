<script setup lang="ts">
  import {
    reactive,
    ref
  } from "vue";
  import app from "../../utils/application";
  import { onShow } from "@dcloudio/uni-app";
  import { useRequest } from "../../utils/hooks";

  const phoneCall = '400 880 1090';
  const userInfo = ref()
  const unreadCount = ref(0)
  const imUrl = ref('/uni_modules/uni-im/pages/index/index');
  const userType = ref<string>('');

  uni.$on('newMsg', value => {
    unreadCount.value = value;
  })

  onShow(() => {
    app.getUserInfo(true).then(data => {
      userInfo.value = data;
      const userRoleInfo = uni.getStorageSync('userRoleInfo');
      userType.value = userRoleInfo;
      if (userType.value !== '1') {
        imUrl.value = `/uni_modules/uni-im/pages/chat/chat?user_id=${data.agentUid}`
      }
	    getQrCode();
    })
  })

  const handlePhoneCall = () => {
    uni.makePhoneCall({
      phoneNumber: phoneCall,
    })
  }

  const handleLogin = (e) => {
    uni.navigateTo({
      url: '/pages/login/index'
    })
  }
  const handleNameAuth = () => {
    if (userInfo.value.customerName) return;
    uni.navigateTo({
      url: '/pages/user/nameAuth'
    })
  }
  // 手机号脱敏
  const mixPhone = (phone) => {
    if (!phone) return;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }

  const qrCode = ref('');
  const popup = ref(null);
  const getQrCode = () => {
    if (qrCode.value) {
      return;
    }
    if (userInfo.value.qrcodeUrl) {
      qrCode.value = userInfo.value.qrcodeUrl;
      return;
    }
    useRequest({
      url: `/basic/qrcode/getWxQRCode`,
      params: {
        scene: userInfo.value.customerId,
        customerId: userInfo.value.customerId,
        page: 'pages/index/index'
      },
      formatted: (data: any) => {
        qrCode.value = data?.replace('profile', 'image');
      }
    });
  }

  const preview = () => {
    popup.value.open();
  }
</script>

<template>
  <view class="header">
    <view class="header-content" v-if="userInfo && userInfo.customerName">
      <image class="avatar" :src="userInfo.avatar || '/static/user_fill_white.png'" />
      <view class="header-info">
        <view class="header-name">{{userInfo.customerName || userInfo.phoneNumber}}
          <text class="header-auth" @click="handleNameAuth">{{ userInfo.verify !== 'T' ? '未认证' : '已认证'}}</text>
        </view>
        <view class="header-phone">{{ mixPhone(userInfo.phoneNumber) }}</view>
      </view>
      <!-- #ifdef MP-WEIXIN -->
	    <image :src="qrCode" class="qrCode" @click="preview"></image>
      <!-- #endif -->
    </view>
    <view class="header-content" v-else>
      <image class="avatar" src="/static/user_fill_white.png" />
      <view class="header-info">
        <button class="phone-btn" plain @click="handleNameAuth">匿名用户</button>
      </view>
    </view>
  </view>
  <!-- <view class="float-box"> -->
    <!-- <navigator url="/pages/platform/notice">
      <uni-notice-bar style="margin-bottom: 0px" showIcon single scrollable
        text="系统公告：请搜索“嘉位招聘”公众号，并关注，享受更多服务，嘉位招聘，注册系统有红包，分享系统有奖金，找工作有返费！">
      </uni-notice-bar>
    </navigator> -->
    <!-- <view class="main-item-container"> -->
      <!-- <navigator url="/pages/user/bindCard" class="main-item">
        <image class="main-item-img" src="/static/bankcard.png" />
        <text class="main-item-txt">我的银行卡</text>
      </navigator> -->
      <!-- <view class="main-item" @click="app.navigateTo({url: '/pages/user/resume', needAuth: true})">
        <image class="main-item-img" mode="aspectFill" src="/static/user-info.png" />
        <text class="main-item-txt">我的简历</text>
      </view>
      <view class="main-item" @click="app.navigateTo({url: '/pages/user/replacement', needAuth: true})">
        <image class="main-item-img" mode="aspectFill" src="/static/user-record.png" />
        <text class="main-item-txt">安置记录</text>
      </view> -->
    <!-- </view> -->
  <!-- </view> -->
  <view class="list">
    <!-- <uni-collapse>
      <uni-collapse-item>
        <template v-slot:title>
          <view class="list-item" :style="{ borderBottomWidth: 0 }">
            <img class="list-icon" src="/static/wallet.png" />
            <view class="list-main">
              <view>我的余额</view>
              <view>
                <text style="color:red">168.06</text>
                <text>元</text>
              </view>
            </view>
          </view>
        </template>
        <view class="inner-list">
          <navigator class="list-item" url="/pages/bonus/bonus">
            <img class="list-icon" src="/static/redpackage.png" />
            <view class="list-main">
              <view>我的红包</view>
            </view>
          </navigator>
          <view class="list-item">
            <img class="list-icon" src="/static/pay.png" />
            <view class="list-main">
              <view>平台打款</view>
            </view>
          </view>
          <view class="list-item">
            <img class="list-icon" src="/static/wallet-red.png" />
            <view class="list-main">
              <view>推荐好友</view>
            </view>
          </view>
        </view>
      </uni-collapse-item>
    </uni-collapse> -->

    <!-- <navigator class="list-item" url="/pages/platform/introduce">
      <img class="list-icon" src="/static/position.png" />
      <view class="list-main">
        <view>平台介绍</view>
      </view>
      <uni-icons type="forward" size="18" color="rgba(64, 61, 61, 0.3)"></uni-icons>
    </navigator> -->
    <!-- <view class="list-item">
      <img class="list-icon" src="/static/people.png" />
      <view class="list-main">
        <view>分享好友<text style="color: red;font-size: 24rpx;">（分享越多，红包越多）</text></view>
        <view class="share-btn">
          分享赚钱
        </view>
      </view>
      <uni-icons type="forward" size="18" color="rgba(64, 61, 61, 0.3)"></uni-icons>
    </view> -->
    <!-- #ifndef MP-KUAISHOU -->
    <navigator class="list-item" :url="imUrl">
      <view class="icon-wrap">
        <uni-icons type="chatboxes" size="28" color="#59c37e"></uni-icons>
      </view>
      <view class="list-main">
        <view>在线咨询</view>
        <uni-badge :text="unreadCount"></uni-badge>
      </view>
      <uni-icons type="forward" size="18" color="rgba(64, 61, 61, 0.3)"></uni-icons>
    </navigator>
    <!-- #endif -->
    <!-- <view class="list-item" @click="app.navigateTo({url: '/pages/user/resume', needAuth: true})">
      <view class="icon-wrap">
        <image class="list-icon" mode="aspectFill" src="/static/user-info.png" />
      </view>
      <view class="list-main">
        <view>我的简历</view>
      </view>
      <uni-icons type="forward" size="18" color="rgba(64, 61, 61, 0.3)"></uni-icons>
    </view> -->
    <view class="list-item" @click="app.navigateTo({url: '/pages/user/replacement', needAuth: true})">
      <view class="icon-wrap">
        <image class="list-icon" mode="aspectFill" src="/static/user-record.png" />
      </view>
        <text class="list-main">安置记录</text>
        <uni-icons type="forward" size="18" color="rgba(64, 61, 61, 0.3)"></uni-icons>
      </view>
    <navigator class="list-item" @click="app.navigateTo({url: '/pages/user/myFeedback', needAuth: true})" url="">
      <view class="icon-wrap">
        <uni-icons type="chat" size="28" color="#498ee8"></uni-icons>
      </view>
      <view class="list-main">
        <view>反馈问题</view>
      </view>
      <uni-icons type="forward" size="18" color="rgba(64, 61, 61, 0.3)"></uni-icons>
    </navigator>
    <view class="list-item" @click="handlePhoneCall">
      <view class="icon-wrap">
        <!-- <img class="list-icon" src="/static/question.png" /> -->
        <uni-icons type="help" size="28" color="#f6c644"></uni-icons>
      </view>
      <view class="list-main">
        <view>投诉电话</view>
        <view style="color: #0170ff;">
          {{phoneCall}}
        </view>
      </view>
      <uni-icons type="forward" size="18" color="rgba(64, 61, 61, 0.3)"></uni-icons>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <!-- <view class="list-item" @click="getQrCode">
      <view class="icon-wrap">
        <uni-icons type="scan" size="24" color="#5e6d82"></uni-icons>
      </view>
      <view class="list-main">
        <view>二维码名片</view>
      </view>
      <uni-icons type="forward" size="18" color="rgba(64, 61, 61, 0.3)"></uni-icons>
    </view> -->
    <!-- #endif -->
    <!-- <navigator class="list-item" style="margin-top: 16rpx" url="/pages/user/setting">
      <view class="icon-wrap">
        <uni-icons type="gear" size="28" color="#498ee8"></uni-icons>
      </view>
      <view class="list-main">
        <view>系统设置</view>
      </view>
      <uni-icons type="forward" size="18" color="rgba(64, 61, 61, 0.3)"></uni-icons>
    </navigator> -->
  </view>
 <uni-popup ref="popup" background-color="#fff">
    <image :src="qrCode" class="preview"></image>
    <view class="title">我的邀请码</view>
  </uni-popup>
</template>

<style>
page {
  background-color: #f7f8f9;
}
</style>
<style scoped lang="scss">
  .header {
    height: 300rpx;
    background: linear-gradient(to right, #0361f9, #04a4ff);
    overflow: hidden;
  }

  .header-content {
    height: 300rpx;
    // margin-top: 40rpx;
    padding: 0 30rpx;
    display: flex;
    align-items: center;
    /* #ifdef MP-WEIXIN */
    justify-content: space-between;
    /* #endif */
  }

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 20rpx;
    background-color: #dedede;
  }

  .share-btn {
    background-color: #f71313;
    color: #fff;
    padding: 8rpx 14rpx;
    border-radius: 6rpx;
    font-size: 24rpx;
  }

  .header-name {
    display: flex;
    align-items: center;
    font-size: 40rpx;
    color: #fff;
    .header-auth {
      display: inline-block;
      margin-left: 24rpx;
      padding: 2rpx 10rpx;
      border: 1px solid #fff;
      border-radius: 4rpx;
      font-size: 20rpx;
    }
  }
  .header-phone {
    margin-top: 10rpx;
    font-size: 28rpx;
    color: #fff;
  }

  .phone-btn {
    font-size: 44rpx;
    color: #fff;
    border-width: 0;
    background-color: transparent;
  }

  .float-box {
    position: relative;
    top: -100rpx;
    margin: 0 30rpx;
    margin-bottom: -80rpx;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(73, 143, 255, 0.2);
    border-radius: 10rpx;
    overflow: hidden;
  }

  .main-item-container {
    display: flex;
    gap: 40rpx;
    padding: 20rpx;
    font-size: 32rpx;
    justify-content: space-evenly;

  }

  .main-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    text-align: center;
    font-size: 28rpx;
    color: #303133;
  }

  .main-item-img {
    margin: 0 auto 16rpx;
    width: 90rpx;
    height: 90rpx;
  }



  .list {
    position: relative;
    // padding: 0 30rpx;
    font-size: 32rpx;
  }

  .inner-list {
    padding-left: 30rpx;
  }

  .list-item {
    padding: 20rpx;
    padding-left: 24rpx;
    border-bottom: 1px solid #eeeeee;
    display: flex;
    align-items: center;
    font-size: 28rpx;
    background-color: #fff;
    .icon-wrap {
      flex: 60rpx 0 0;
    }
    &:last-child {
      border-bottom: none;
    }
  }

  .list-icon {
    width: 48rpx;
    min-width: 48rpx;
    height: 48rpx;
  }

  .list-main {
    flex: 1;
    padding: 0 24rpx;
    display: flex;
    font-size: 34rpx;
    color: #303133;
    font-weight: 400;
    justify-content: space-between;
    align-items: center;

  }
  .qrCode {
    width: 150rpx;
    height: 150rpx;
    margin-left: 100rpx;
    border-radius: 10rpx;
  }
  .ml-20 {
	  margin-left: 20px;
  }
  .preview {
    width: 400rpx;
    height: 400rpx;
  }
  .title {
    padding: 4rpx 0;
    text-align: center;
    font-size: 32rpx;
    font-weight: 600;
    color: #303133;
  }
</style>

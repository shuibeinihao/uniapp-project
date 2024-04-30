<template>
  <view>
    <uni-section v-if="userType" title="工作台" type="line" padding>
			<uni-grid :column="3" :highlight="true" :showBorder="false">
				<uni-grid-item v-for="(item, index) in menus" :index="index" :key="index">
					<view class="grid-item-box" v-if="item.auth.includes(userType)" @click="change(item)">
            <image class="icon" :src="item.icon"></image>
						<text class="text">{{ item.title }}</text>
					</view>
				</uni-grid-item>
			</uni-grid>
		</uni-section>
    <view v-else class="no-auth">
      <uni-icons type="locked-filled" size="60" color="#999"></uni-icons>
      <text>暂无数据</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onShow } from "@dcloudio/uni-app";

const menus = ref<Array<Menu>>([
  {
    title: '用户管理',
    icon: '/static/icon-user.png',
    path: '/workbench/pages/user',
    auth: ['0', '1']
  },
  {
    title: '招聘目录',
    icon: '/static/workbench-fill.png',
    path: '/workbench/pages/recruit',
    auth: ['0', '1'] // 0-管理员, 1-经纪人有权限
  },
  {
    title: '安置记录',
    icon: '/static/icon-anzhi.png',
    path: '/workbench/pages/replacement',
    auth: ['0', '1']
  },
  {
    title: '问题反馈',
    icon: '/static/question.png',
    path: '/workbench/pages/comment',
    auth: ['0', '1']
  },
  {
    title: '统计报表',
    icon: '/static/icon-report.png',
    path: '/workbench/pages/report',
    auth: ['0', '1'] // 0-管理员, 1-经纪人有权限
  }]);

const userType = ref<string>('');

onLoad((options) => {
});

onShow(() => {
  const userRoleInfo = uni.getStorageSync('userRoleInfo');
  userType.value = userRoleInfo;
  if (!userRoleInfo) {
    // uni.showToast({ title: '暂无权限', icon: 'none' });
    setTimeout(() => {
      // uni.switchTab({ url: '/pages/index/index' });
    }, 200);
  }
});

const change = (item: Menu) => {
  uni.navigateTo({ url: item.path });
};
</script>

<style lang="scss" scoped>
.grid-item-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  .icon {
    width: 64rpx;
    height: 64rpx;
    margin-bottom: 16rpx;
  }
  .text {
    font-size: 28rpx;
    color: #333;
  }
}
.no-auth {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text {
    margin-top: 16rpx;
    font-size: 28rpx;
    color: #999;
  }
}
</style>

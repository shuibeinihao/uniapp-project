<template>
  <view class="container">
    <view class="seach-bar" @click="change">
      <!-- <uni-search-bar v-if="userType === '0'" class="flex" v-model="agentName_like" radius="100" placeholder="经纪人账号" clearButton="none" cancelButton="none" @confirm="getReportData" /> -->
      <uni-data-select v-if="userType === '0'" v-model="agentId" :localdata="agentList" placeholder="请选择经纪人" style="flex: 1" @change="onAgentChange"></uni-data-select>
      <view class="filter">
        <view class="seach-bar-item" :class="{active: timeType === '1'}" data-type="1">今日</view>
        <view class="seach-bar-item" :class="{active: timeType === '2'}" data-type="2">本周</view>
        <view class="seach-bar-item" :class="{active: timeType === '3'}" data-type="3">本月</view>
        <view class="seach-bar-item" :class="{active: timeType === '4'}" data-type="4">上月</view>
      </view>
    </view>
    <uni-section title="全职" type="line">
    </uni-section>
    <uni-card title="签到" :extra="`${state?.data?.signTotal || 0}人`">
      <uni-row>
        <uni-col :span="6">
          <view class="label">?</view>
          <view class="value">{{ state?.data?.signObj.null || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">取消</view>
          <view class="value">{{ state?.data?.signObj.C || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">暂停</view>
          <view class="value">{{ state?.data?.signObj.R || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">已签到</view>
          <view class="value">{{ state?.data?.signObj.P || 0 }}/<text>{{ state?.data?.signObj.signP || 0 }}</text></view>
        </uni-col>
      </uni-row>
    </uni-card>
    <uni-card title="面试" :extra="`${state?.data?.interviewTotal || 0}人`">
      <uni-row>
        <uni-col :span="5">
          <view class="label">?</view>
          <view class="value">{{ state?.data?.interviewObj.null || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">准备面试</view>
          <view class="value">{{ state?.data?.interviewObj.S || 0 }}</view>
        </uni-col>
        <uni-col :span="4">
          <view class="label">放弃</view>
          <view class="value">{{ state?.data?.interviewObj.C || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">未通过</view>
          <view class="value">{{ state?.data?.interviewObj.R || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">通过</view>
          <view class="value">{{ state?.data?.interviewObj.P || 0 }}/<text>{{ state?.data?.interviewObj.interviewP || 0 }}</text></view>
        </uni-col>
      </uni-row>
    </uni-card>
    <uni-card title="入职" :extra="`${state?.data?.entryTotal || 0}人`">
      <uni-row>
        <uni-col :span="6">
          <view class="label">?</view>
          <view class="value">{{ state?.data?.entryObj.null || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">未报到</view>
          <view class="value">{{ state?.data?.entryObj.C || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">被拒绝</view>
          <view class="value">{{ state?.data?.entryObj.R || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">入职</view>
          <view class="value">{{ state?.data?.entryObj.P || 0 }}/<text>{{ state?.data?.entryObj.entryP || 0 }}</text></view>
        </uni-col>
      </uni-row>
    </uni-card>
    <uni-card title="在离职" :extra="`${state?.data?.leaveTotal || 0}人`">
      <uni-row>
        <uni-col :span="5">
          <view class="label">?</view>
          <view class="value">{{ state?.data?.leaveObj.null || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">自离</view>
          <view class="value">{{ state?.data?.leaveObj['1'] || 0 }}</view>
        </uni-col>
        <uni-col :span="4">
          <view class="label">劝退</view>
          <view class="value">{{ state?.data?.leaveObj['2'] || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">满3天</view>
          <view class="value">{{ state?.data?.leaveObj['3'] || 0 }}/<text>{{ state?.data?.leaveObj.leave3 || 0 }}</text></view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">满月</view>
          <view class="value">{{ state?.data?.leaveObj['4'] || 0 }}</view>
        </uni-col>
      </uni-row>
    </uni-card>
    <uni-section title="兼职" type="line">
    </uni-section>
    <uni-card title="签到" :extra="`${state?.data1?.signTotal || 0}人`">
      <uni-row>
        <uni-col :span="6">
          <view class="label">?</view>
          <view class="value">{{ state?.data1?.signObj.null || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">取消</view>
          <view class="value">{{ state?.data1?.signObj.C || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">暂停</view>
          <view class="value">{{ state?.data1?.signObj.R || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">已签到</view>
          <view class="value">{{ state?.data1?.signObj.P || 0 }}/<text>{{ state?.data1?.signObj.signP || 0 }}</text></view>
        </uni-col>
      </uni-row>
    </uni-card>
    <uni-card title="面试" :extra="`${state?.data1?.interviewTotal || 0}人`">
      <uni-row>
        <uni-col :span="5">
          <view class="label">?</view>
          <view class="value">{{ state?.data1?.interviewObj.null || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">准备面试</view>
          <view class="value">{{ state?.data1?.interviewObj.S || 0 }}</view>
        </uni-col>
        <uni-col :span="4">
          <view class="label">放弃</view>
          <view class="value">{{ state?.data1?.interviewObj.C || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">未通过</view>
          <view class="value">{{ state?.data1?.interviewObj.R || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">通过</view>
          <view class="value">{{ state?.data1?.interviewObj.P || 0 }}/<text>{{ state?.data1?.interviewObj.interviewP || 0 }}</text></view>
        </uni-col>
      </uni-row>
    </uni-card>
    <uni-card title="入职" :extra="`${state?.data1?.entryTotal || 0}人`">
      <uni-row>
        <uni-col :span="6">
          <view class="label">?</view>
          <view class="value">{{ state?.data1?.entryObj.null || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">未报到</view>
          <view class="value">{{ state?.data1?.entryObj.C || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">被拒绝</view>
          <view class="value">{{ state?.data1?.entryObj.R || 0 }}</view>
        </uni-col>
        <uni-col :span="6">
          <view class="label">入职</view>
          <view class="value">{{ state?.data1?.entryObj.P || 0 }}/<text>{{ state?.data1?.entryObj.entryP || 0 }}</text></view>
        </uni-col>
      </uni-row>
    </uni-card>
    <uni-section title="未联" type="line">
    </uni-section>
    <uni-card>
      <uni-row>
        <uni-col :span="5">
          <view class="label">待沟通</view>
          <view class="value">{{ constomerState?.data?.unContractTotal || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">今日维护</view>
          <view class="value">{{ constomerState?.data?.todayCount || 0 }}</view>
        </uni-col>
        <uni-col :span="4">
          <view class="label">超180天</view>
          <view class="value">{{ constomerState?.data?.unContract180 || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">超365天</view>
          <view class="value">{{ constomerState?.data?.unContract365 || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">超730天</view>
          <view class="value">{{ constomerState?.data?.unContract730 || 0 }}</view>
        </uni-col>
      </uni-row>
    </uni-card>
    <!-- <uni-card title="在离职" :extra="`${state?.data1?.leaveTotal || 0}人`">
      <uni-row>
        <uni-col :span="5">
          <view class="label">?</view>
          <view class="value">{{ state?.data1?.leaveObj.null || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">自离</view>
          <view class="value">{{ state?.data1?.leaveObj['1'] || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">劝退</view>
          <view class="value">{{ state?.data1?.leaveObj['2'] || 0 }}</view>
        </uni-col>
        <uni-col :span="5">
          <view class="label">满3天</view>
          <view class="value">{{ state?.data1?.leaveObj['3'] || 0 }}</view>
        </uni-col>
        <uni-col :span="4">
          <view class="label">满月</view>
          <view class="value">{{ state?.data1?.leaveObj['4'] || 0 }}</view>
        </uni-col>
      </uni-row>
    </uni-card> -->
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import dayjs from 'dayjs';
import { onLoad } from "@dcloudio/uni-app";
import request from '@/utils/request';
import app from '../../utils/application';
import { useListRequest, useRequest } from '@/utils/hooks';


const state = reactive({});
const timeType = ref('1');
const agentName_like = ref('');
const agentId = ref('');
const userType = ref('');

onLoad(() => {
  const userRoleInfo = uni.getStorageSync('userRoleInfo');
  userType.value = userRoleInfo;
  app.getUserInfo().then((res) => {
    // 如果不是管理员，只能查看自己的
    if (userType.value !== '0') {
      agentName_like.value = res.customerName;
    }
    getReportData();
  })
});

const agentList = ref([]);

useRequest({
  url: `/system/config/configKey/sys.agent.roleId`,
  method: 'get',
  formatted: (res) => {
    useRequest({
      url: '/mobile/user/list',
      method: 'get',
      params: {
        roleId: res.msg
      },
      formatted: (res) => {
        agentList.value = res.rows?.map(item => {
          item.text = item.nickName;
          item.value = item.userId;
          return item;
        });
      }
    })
  }
})

const onAgentChange = (e: any) => {
  agentId.value = e;
  getReportData();
  run({ agentId: e});
}

const { state: constomerState, run } = useRequest({
  url: '/mobile/customer/stats',
  method: 'get'
})

const interviewDate = computed(() => {
  if (timeType.value === '1') {
    return [dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')];
  } else if (timeType.value === '2') {
    return [dayjs().startOf('week').format('YYYY-MM-DD'), dayjs().endOf('week').format('YYYY-MM-DD')];
  } else if (timeType.value === '3') {
    return [dayjs().startOf('month').format('YYYY-MM-DD'), dayjs().endOf('month').format('YYYY-MM-DD')];
  } else if (timeType.value === '4') {
    return [dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'), dayjs().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')];
  }
});

const getReportData = () => {
  request({
    url: `/mobile/position/1/${timeType.value}`,
    method: 'get', // 全职
    data: {
      agentId: agentId.value,
    }
  }).then(res => {
    state.data = formattedData(res.data);
  });
  request({
    url: `/mobile/position/2/${timeType.value}`,
    method: 'get', // 兼职
    data: {
      agentId: agentId.value
    }
  }).then(res => {
    state.data1 = formattedData(res.data);
  });
}

const formattedData = (data: any) => {
  // 获取签到数据
  const signData = data?.sign;
  const signTotal = signData?.reduce((total : number, item : any) => {
    return total + item.amount;
  }, 0);
  const signObj = signData?.reduce((obj : any, item : any) => {
    obj[item.state] = item.amount;
    obj[`sign${item.state}`] = (item.amount / (signTotal || 1) * 100).toFixed(1) + '%';
    return obj;
  }, {});
  // 获取面试数据
  const interviewData = data?.interview;
  // 面试总数=已签到+签到状态为null的
  const interviewTotal = signData?.filter(p => !p.state || p.state === 'P').reduce((total : number, item : any) => {
    return total + item.amount;
  }, 0);
  const interviewObj = interviewData?.reduce((obj : any, item : any) => {
    obj[item.state] = item.amount;
    obj[`interview${item.state}`] = (item.amount / (interviewTotal || 1) * 100).toFixed(1) + '%';
    return obj;
  }, {});
  // 获取入职数据
  const entryData = data?.entry;
  // 入职总数=面试通过+面试状态为null的
  const entryTotal = interviewData?.filter(p => !p.state || p.state === 'P').reduce((total : number, item : any) => {
    return total + item.amount;
  }, 0);
  const entryObj = entryData?.reduce((obj : any, item : any) => {
    obj[item.state] = item.amount;
    obj[`entry${item.state}`] = (item.amount / (entryTotal || 1) * 100).toFixed(1) + '%';
    return obj;
  }, {});
  // 获取在离职数据
  const leaveData = data?.depart;
  // 在离职总数=入职通过+入职状态为null的
  const leaveTotal = entryData?.filter(p => !p.state || p.state === 'P').reduce((total : number, item : any) => {
    return total + item.amount;
  }, 0);
  const leaveObj = leaveData?.reduce((obj : any, item : any) => {
    obj[item.state] = item.amount;
    obj[`leave${item.state}`] = (item.amount / (leaveTotal || 1) * 100).toFixed(1) + '%';
    return obj;
  }, {});

  return {
    signTotal,
    signObj,
    interviewTotal,
    interviewObj,
    entryTotal,
    entryObj,
    leaveTotal,
    leaveObj
  };
}

const change = (e: MouseEvent) => {
  const { type } = e.target?.dataset;
  if (!type) return;
  timeType.value = type
  getReportData();
}
</script>

<style>
page {
  background-color: #f7f8fa;
}
</style>
<style lang="scss" scoped>
.container {
  padding-bottom: 24rpx;
  .seach-bar {
    position: sticky;
    top: 0;
    padding: 0 24rpx;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    box-shadow: 0 2rpx 4rpx 0 rgba(0, 0, 0, 0.1);
    .flex {
      flex: 1.5;
    }
    .filter {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 15px 0;
    }
    &-item {
      padding: 0 12rpx;
      font-size: 28rpx;
      color: #303133;
      white-space: nowrap;
      box-sizing: border-box;
      &.active {
        color: #2979ff;
        font-weight: 500;
      }
    }
  }
  .label {
    font-size: 28rpx;
    text-align: center;
  }
  .value {
    margin-top: 16rpx;
    font-size: 32rpx;
    color: #303133;
    text-align: center;
    font-weight: 500;
    text {
      font-size: 24rpx;
      color: #2979ff;
    }
  }
}
</style>

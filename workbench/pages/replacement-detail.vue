<template>
  <view class="container">
    <!-- <view class="head">
      <view class="info">
        <text class="post-type" :class="`post-type-${formData.positionType}`">{{ getRowsName(formData.positionType, labelData?.data?.enterprise_post_info_post_type) }}</text>
        <text class="name">{{ formData.customerName }}</text>
        <text class="sex" :class="`sex-${formData.sex}`">{{ getRowsName(formData.sex, sexArr) }}</text>
        <text>{{ getUserAge(formData.idCard) }}岁</text>
      </view>
      <view class="phone">{{ formData.phoneNumber }}</view>
    </view> -->
    <view class="content">
      <uni-section title="基础信息" type="line">
        <uni-list-item title="类型" :rightText="getRowsName(formData.positionType, labelData?.data?.enterprise_post_info_post_type)"></uni-list-item>
        <uni-list-item title="企业简称" :rightText="formData?.enterpriseSimpleName"></uni-list-item>
        <uni-list-item title="工种" :rightText="formData?.workTypeName"></uni-list-item>
        <uni-list-item title="报价" :rightText="getRowsName(formData?.offerPrice, labelData.data?.enterprise_post_info_offer_price)"></uni-list-item>
        <uni-list-item title="招聘政策" direction="column">
          <template v-slot:footer>
            <rich-text class="rich-text" :nodes="formatRichText(formData.recruitPolicy)"></rich-text>
          </template>
        </uni-list-item>
        <uni-list-item title="入职须知" direction="column">
          <template v-slot:footer>
            <rich-text class="rich-text" :nodes="formatRichText(formData.inductionNoticy)"></rich-text>
          </template>
        </uni-list-item>
        <uni-list-item title="姓名" :rightText="formData?.customerName"></uni-list-item>
        <uni-list-item title="性别" :rightText="getRowsName(formData.sex, sexArr)"></uni-list-item>
        <uni-list-item title="年龄" :rightText="getUserAge(formData.idCard)"></uni-list-item>
        <uni-list-item title="户籍" :rightText="formData?.birthAddress"></uni-list-item>
        <uni-list-item title="民族" :rightText="getRowsName(formData.nation, labelData.data?.customer_info_nation)"></uni-list-item>
        <uni-list-item title="身份证号码" :rightText="formData?.idCard"></uni-list-item>
        <uni-list-item title="手机号" :rightText="formData?.phoneNumber" clickable @click="makeCall(formData?.phoneNumber)"></uni-list-item>
      </uni-section>
      <!-- <uni-section title="求职者信息" type="line">
        <uni-list-item title="户籍" :rightText="formData?.birthAddress"></uni-list-item>
        <uni-list-item title="民族" :rightText="getRowsName(formData.nation, labelData.data?.customer_info_nation)"></uni-list-item>
        <uni-list-item title="身份证号码" :rightText="formData?.idCard"></uni-list-item>
      </uni-section> -->
      <uni-section title="签到" type="line">
        <uni-list-item title="时间" :rightText="dayjs(formData.signTime).format('YYYY-MM-DD HH:mm')"></uni-list-item>
        <uni-list-item title="集合点" :rightText="getRowsName(formData?.gatherPoint, labelData.data?.enterprise_post_info_gather_point) || '?'"></uni-list-item>
        <uni-list-item title="状态" :rightText="getRowsName(formData?.signState, signStatusArr) || '?'"></uni-list-item>
        <uni-list-item title="说明" :rightText="formData?.signDesc"></uni-list-item>
      </uni-section>
      <uni-section title="面试" type="line">
        <uni-list-item title="状态" :rightText="getRowsName(formData?.interviewState, interviewStatusArr) || '?'"></uni-list-item>
        <uni-list-item title="说明" :rightText="formData?.interviewDesc"></uni-list-item>
      </uni-section>
      <uni-section title="入职" type="line">
        <uni-list-item title="日期" :rightText="formateDateTime(formData?.entryDate, 'YYYY/MM/DD')"></uni-list-item>
        <uni-list-item title="状态" :rightText="getRowsName(formData?.entryState, entryStatusArr) || '?'"></uni-list-item>
        <uni-list-item title="说明" :rightText="formData?.entryDesc"></uni-list-item>
      </uni-section>
      <uni-section title="在离职" type="line">
        <uni-list-item title="日期" :rightText="formateDateTime(formData?.departDate, 'YYYY/MM/DD')"></uni-list-item>
        <uni-list-item title="状态" :rightText="getRowsName(formData?.departState, departStatusArr) || '?'"></uni-list-item>
        <uni-list-item title="说明" :rightText="formData?.departDesc"></uni-list-item>
      </uni-section>
      <uni-section title="求职者结算" type="line">
        <uni-list-item title="状态" :rightText="getRowsName(formData?.memeberState, memberSettleStatusArr)"></uni-list-item>
        <uni-list-item title="金额(元)" :rightText="formData.memberAmount"></uni-list-item>
        <uni-list-item title="备注" :rightText="formData?.memberDesc"></uni-list-item>
      </uni-section>
      <uni-section title="推荐费结算" type="line">
        <uni-list-item title="推荐人" :rightText="formData?.referenceName"></uni-list-item>
        <uni-list-item title="推荐人身份证号" :rightText="formData?.referenceIdCard"></uni-list-item>
        <uni-list-item title="推荐人身份" :rightText="formData?.referenceType"></uni-list-item>
        <uni-list-item title="本次标准" :rightText="formData?.referenceStandard"></uni-list-item>
        <uni-list-item title="状态" :rightText="getRowsName(formData?.referenceState, referenceSettleStatusArr)"></uni-list-item>
        <uni-list-item title="金额(元)" :rightText="formData.referenceAmount"></uni-list-item>
        <uni-list-item title="备注" :rightText="formData?.referenceDesc"></uni-list-item>
      </uni-section>
      <uni-section title="经纪人结算" type="line">
        <uni-list-item title="经纪人账号" :rightText="formData?.agentName"></uni-list-item>
        <uni-list-item title="经纪人姓名" :rightText="formData?.agentRealName"></uni-list-item>
        <uni-list-item title="经纪人身份证号" :rightText="formData?.agentIdCard"></uni-list-item>
        <uni-list-item title="结算标准" :rightText="formData?.agentStandard"></uni-list-item>
        <uni-list-item title="状态" :rightText="getRowsName(formData?.agentState, agentSettleStatusArr)"></uni-list-item>
        <uni-list-item title="金额(元)" :rightText="formData.agentAmount"></uni-list-item>
        <uni-list-item title="备注" :rightText="formData?.agentDesc"></uni-list-item>
      </uni-section>
    </view>
    <view class="footer">
      <button :class="{active: formData.signState === 'P'}" @click="handleAction('signShow')">签到</button>
      <!-- <button v-if="!['C', 'R'].includes(formData.signState) && formData.interviewState !== 'P'" @click="handleAction('interviewShow')">面试</button> -->
      <button :class="{active: formData.interviewState === 'P'}" @click="handleAction('interviewShow')">面试</button>
      <button :class="{active: formData.entryState === 'P'}" @click="handleAction('entryShow')">入职</button>
      <button :class="{active: ['3', '4'].includes(formData.departState)}" @click="handleAction('departShow')">在离职</button>
    </view>
    <placement-sign-modal
      v-if="action.showType === 'signShow'"
      :data="action.data"
      @close="action = {}"
      @ok="handleActionModalOk"
    />
    <placement-interview-modal
      v-if="action.showType === 'interviewShow'"
      :data="action.data"
      @close="action = {}"
      @ok="handleActionModalOk"
    />
    <placement-entry-modal
      v-if="action.showType === 'entryShow'"
      :data="action.data"
      @close="action = {}"
      @ok="handleActionModalOk"
    />
    <placement-depart-modal
      v-if="action.showType === 'departShow'"
      :data="action.data"
      @close="action = {}"
      @ok="handleActionModalOk"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from "@dcloudio/uni-app";
import dayjs from 'dayjs';
import { useListRequest, useRequest } from '@/utils/hooks';
import request from '../../utils/request';
import { getRowsName, getUserAge, formatRichText, formateDateTime } from '@/utils';
import { sexArr, departStatusArr,
  entryStatusArr, interviewStatusArr,
  signStatusArr, memberSettleStatusArr,
  referenceSettleStatusArr, agentSettleStatusArr
} from '@/constants';

const id = ref<string>('');

const formData = ref({});

const { state: labelData } = useRequest({
  url: '/system/dict/data/listAll',
  method: 'get',
  formatted: (res : any) => {
    const data : Record<string, Array<{
      key : string; name : string;
    }>> = {}
    if (Array.isArray(res)) {
      res.forEach((item : any) => {
        const key = `${item.dictType}`
        if (!data[key]) {
          data[key] = [{ key: item.dictValue, name: item.dictLabel }]
        } else {
          data[key].push({ key: item.dictValue, name: item.dictLabel})
        }
      })
    }
    return data;
  }
});

onLoad((options: any) => {
  id.value = options.id;
  if (id.value) {
    getAgentPositionInfo();
  }
});

const getAgentPositionInfo = () => {
  request({
    url: '/placement/position/getInfoById',
    method: 'get',
    data: {
      id: id.value
    }
  }).then((res: any) => {
    if (res.data) {
      formData.value = res.data;
    }
  })
}

const action = ref<{
  showType ? : string;data ? : any;
}> ({});

const handleAction = (showType: string) => {
  action.value = {
    showType,
    data: formData.value
  };
}

const handleActionModalOk = (data: any) => {
  action.value = {};
  getAgentPositionInfo();
  uni.$emit('placement:reload');
}

const makeCall = (phone: string) => {
  if (!phone) {
    return;
  }
  uni.makePhoneCall({
    phoneNumber: phone
  })
}

</script>

<style>
page {
  background-color: #f7f8fa;
}
</style>
<style lang="scss" scoped>
.container {
  .head {
    position: sticky;
    top: 0;
    margin-bottom: 12rpx;
    padding: 12rpx 24rpx;
    font-size: 28rpx;
    color: #303133;
    background-color: #fff;
    box-shadow: 0 2rpx 10rpx 0 rgba(0, 0, 0, 0.1);
    z-index: 9;
    .info {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
    }
    .post-type {
      display: inline-block;
      margin-right: 12rpx;
      padding: 0 8rpx;
      font-size: 22rpx;
      color: #fff;
      border-radius: 4rpx;
      &-1 {
        background-color: #2979ff;
      }
      &-2 {
        background-color: #EF5340;
      }
    }
    .name {
      margin-right: 12rpx;
      font-size: 30rpx;
      font-weight: 500;
    }
    .sex {
      margin-right: 12rpx;
      color: #4ea6f3;
      &-F {
        color: #eb50c4;
      }
    }
  }
  .content {
    padding-bottom: 140rpx;
    .rich-text {
      font-size: 28rpx;
      color: #606266;
    }
  }
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    padding: 12rpx 32rpx 24rpx;
    background-color: #fff;
    box-shadow: 0 -2rpx 4rpx 0 rgba(0, 0, 0, 0.1);
    z-index: 9;
    button {
      display: inline-block;
      flex: 1;
      line-height: 56rpx;
      font-size: 26rpx;
      border-radius: 30rpx;
      font-weight: bold;
      color: #ef5340;
      border: 1px solid #ef5340;
      background-color: transparent;
      box-sizing: border-box;
      & + button {
        margin-left: 24rpx;
      }
      &::after {
        border: none;
      }
      &.active {
        background-color: #2979ff;
        color: #fff;
        border-color: #2979ff;
      }
    }
  }
}
</style>

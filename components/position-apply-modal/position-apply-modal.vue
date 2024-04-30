<script setup lang="ts">
  // 岗位报名

  import { computed, onMounted, reactive, ref } from "vue";
  import app from "../../utils/application";
  import request from "../../utils/request";
  import dayjs from 'dayjs'
import { getGlobalData } from "../../global_data";

  const props = defineProps<{
    post : any;
    workTypeName : string;
    gatherPointData ?: any[],
    referrerId?: string;
  }>()

  const emit = defineEmits<{
    (event : 'close') : void;
  }>()

  const dateStart = Date.now();
  const dateEnd = dayjs().add(4, 'month').unix() * 1000;

  const gatherPointData = computed(() => {
    if (!props.gatherPointData) return;

    return props.gatherPointData.map(item => ({
      text: item.name,
      value: item.key,
    }))
  })

  const formModel = ref<Record<string, any>>({
    date: props.post.recruitmentDate,
    time: props.post.recruitmentDate === dayjs().format('YYYY-MM-DD') ? dayjs().add(2, "minute").format('HH:mm') : '00:01'
  })

  const submitting = ref(false)

  const submitForm = async () => {
    const post = props.post;

    if (submitting.value) return;

    if (!formModel.value.gatherPoint) {
      uni.showToast({
        icon: 'none',
        title: '请选择集合点'
      })
      return;
    }

    const signTimeDay = dayjs(`${formModel.value.date} ${formModel.value.time}`)


    if (signTimeDay < dayjs()) {
      uni.showToast({
        icon: 'none',
        title: '面试时间已过期'
      })
      return;
    }
    submitting.value = true;

    try {
      const userInfo = await app.getUserInfo();

      // 后端加了校验，不需要前端校验了
      // const res = await request({
      //   url: '/placement/position/list',
      //   method: 'get',
      //   data: {
      //     customerId: userInfo.customerId,
      //     positionType: post.postType,
      //     interviewDate: formModel.value.date,
      //   }
      // })
      // if (res.rows && res.rows.length > 0) {
      //   throw new Error(res.rows[0].recruitmentId === props.post.recruitmentId ? '您已报名成功，请勿重复报名' : '同一天“全职或兼职”只能各报一次')
      // }

      // let referInfoRes : any;
      // if (userInfo.referrerId) {
      //   referInfoRes = await request({
      //     url: '/queryCustomerInfo',
      //     data: {
      //       customerId: userInfo.referrerId
      //     }
      //   })
      // }

      // const referInfo = referInfoRes?.data;
      const referrefInfo = getGlobalData('referrerInfo')
      const referrerId = getGlobalData('referrerId')
      console.log('分享人ID', props.referrerId);
      await request({
        url: '/placement/position/create',
        data: {
          gatherPoint: formModel.value.gatherPoint,
          //signPosition: post.signPosition,
          signTime: signTimeDay.format('YYYY-MM-DD HH:mm:ss'),
          interviewDate: formModel.value.date,
          recruitmentId: post.recruitmentId,
          positionType: post.postType,
          enterpriseSimpleName: post.enterpriseName,
          enterpriseId: post.enterpriseId,
          workType: post.workType,
          workTypeName: props.workTypeName,
          offerPrice: post.offerPrice,
          recruitPolicy: post.recruitPolicy,
          inductionNoticy: post.inductionNoticy,
       //   signLnglat: post.workAddressLnglat,
          referenceStandard: post.recommendFee,
          agentStandard: post.agentRate,
          agentId: userInfo.agentId,
          customerName: userInfo.customerName,
          sex: userInfo.sex,
          birthAddress: userInfo.address,
          nation: userInfo.nation,
          idCard: userInfo.idCard,
          phoneNumber: userInfo.phoneNumber,
          customerId: userInfo.customerId,
          shareCustomerId: props.referrerId,
          referrerId: referrerId || userInfo.referrerId, // 如果没有分享人ID，就用自己的推荐人ID
          referenceName: referrefInfo?.customerName || userInfo?.customerName,
          referenceIdCard: referrefInfo?.idCard || userInfo.idCard,
          referenceType: referrefInfo?.identity || userInfo.identity,
          recruitmentDate: post.recruitmentDate,

        }
      })
      uni.showToast({
        icon: 'none',
        title: '报名成功',
        success() {
          // setTimeout(() => {
          //   uni.navigateTo({
          //     url: '/pages/user/replacement'
          //   })

          // }, 1000)
        }
      })
      emit('close')
      await app.subscribeMessage(['medfcBbVF-DdDfaNvLfgsICnhAjeyj6-5tYHdCx89VM', 'QcL82Renm_mUK4BhQy9WpldxD_-bJnF1aIzGx2k3Ug8']);

    } catch (e) {
      submitting.value = false;
      uni.showToast({
        icon: 'none',
        title: e.message
      })
    }

  }
</script>

<template>
  <view class="position-apply-modal">
    <view class="body">
      <view class="title">填写报名信息</view>
      <uni-forms :label-width="80">
        <uni-forms-item label="面试日期:" required>
          <uni-datetime-picker type="date" :clearIcon="false" v-model="formModel.date" :start="dateStart" :end="dateEnd"
            @change="formModel.time = '00:01'"></uni-datetime-picker>
        </uni-forms-item>
        <uni-forms-item label="面试时间:" required>
          <picker mode="time" :value="formModel.time" @change="e=> formModel.time=e.detail.value">
            <view class="input-box">{{formModel.time}}</view>
          </picker>
        </uni-forms-item>
        <uni-forms-item label="集合点:" required>
          <uni-data-select v-model="formModel.gatherPoint" :localdata="gatherPointData"
            placeholder="请选择集合点"></uni-data-select>
        </uni-forms-item>
        <view class="tip">注： 同一天“全职或兼职”只能各报一次， 报名后如要修改，请拨打经纪人电话人工修改！ </view>
        <button class="ok-btn" @click="submitForm" :loading="submitting">立即报名</button>
      </uni-forms>
    </view>
    <view style="margin-top: 10px; text-align: center;" @click="emit('close')">
      <uni-icons type="close" color="#fff" size="32"></uni-icons>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .position-apply-modal {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    touch-action: none;
    z-index: 100;
    background-color: rgba(0, 0, 0, .3);
    overflow: auto;

    .body {
      margin: 100px auto 0 auto;
      width: 300px;
      padding: 32rpx;
      max-width: 90vw;
      min-height: 100px;
      background-color: #fff;
      border-radius: 9px;
      box-sizing: border-box;
    }

    .title {
      font-size: 18px;
      text-align: center;
      margin-bottom: 15px;
    }

    .tip {
      color: red;
      font-size: 12px;
    }

    .input-box {
      height: 35px;
      line-height: 35px;
      border: 1px solid #e5e5e5;
      border-radius: 4px;
      box-sizing: border-box;
      padding-left: 10px;
    }

    .ok-btn {
      width: 80%;
      margin: 15px 10% 0 10%;
      height: 34px;
      font-size: 14px;
      border-radius: 8px;
      color: #fff;
      background-color: #feb800;
      &::after {
        border-color: #feb800;
      }
    }
  }
</style>
<script setup lang="ts">
  import {
    onLoad,
  } from "@dcloudio/uni-app";
  import { computed, ref, watchPostEffect } from "vue";
  import app from "../../utils/application";
  import request from "../../utils/request";
  import { formateDateTime, getRowsName, formatRichText } from '../../utils'
  import { placementDescDefault, interviewStatusArr, signStatusArr, memberSettleStatusArr } from './service'
  import { useRequest,useListRequest } from "../../utils/hooks";
  import dayjs from 'dayjs'

  const list = ref<any[]>([])

  const recruitmentData = ref<Record<string, any>>({})

  const current = ref(0)

  watchPostEffect(() => {
    const position = list.value[current.value];
    if (!position) return null;
    if (!position.recruitmentId || recruitment[position.recruitmentId]) return;

    request({
      url: '/goods/recruitment/getInfoById',
      method: 'get',
      data: {
        recruitmentId: position.recruitmentId
      }

    }).then(res => {
      recruitmentData.value[position.recruitmentId] = res.data || {};
    }).catch(() => { })
  })

  const {
    state: labelState
  } = useRequest({
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
  })

  const recruitment = computed(() => {
    const position = list.value[current.value];
    if (!position) return null;
    return recruitmentData.value[position.recruitmentId]
  })

  onLoad((query) => {
    uni.showLoading({
      title: 'loading'
    })
    app.getUserInfo(true).then(res => {
      request({
        url: '/mobile/position/private/list',
        method: 'get',
        data: {
          customerId: res.customerId,
        }
      }).then(res => {
        uni.hideLoading()
        const data = res.data || [];
        data.sort((a,b)=> {
          return dayjs(a.signTime) > dayjs(b.signTime) ? -1 : 1
        });
        list.value = data;
      }).catch((err) => {
        uni.showToast({
          icon: 'none',
          title: err.message
        })
      })
    })
  })

  const handlePhoneCall = (phoneNumber ?: string) => {
    if (!phoneNumber) return;
    uni.makePhoneCall({
      phoneNumber,
    })
  }
  const handleNaviMap = (record?: any) => {
    if (!record || !record.signLnglat) return;
    const lnglat = record.signLnglat.split(',')
    uni.openLocation({
      latitude: +lnglat[1],
      longitude: +lnglat[0],
      name: record.signPosition
    })
    // uni.navigateTo({
    //   url: `/pages/map/navigation?targetLnglat=${record.signLnglat}&targetName=${record.signPosition}`
    // })
  }

  const handleContact = () => {
    app.getUserInfo().then(res => {
      uni.makePhoneCall({
        phoneNumber: res.agentPhone || '400 880 1090',
      })
    })
  }
  const showContact = ref(false);
  
</script>

<template>
  <view class="replacement-page">
<!--    <view class="logo-container">
      <image class="logo" src="/static/logo_title.jpg"></image>
    </view> -->
    <view v-if="list.length == 0" class="empty-txt">暂无安置信息</view>

    <view v-if="list[current]">
      <view v-if="current !== 0" class="fixed-btn btn-left" @click="current = current -1">
        <uni-icons type="left" color="#fff" size="28"></uni-icons>
      </view>
      <view v-if="current !== list.length -1" class="fixed-btn btn-right" @click="current = current + 1">
        <uni-icons type="right" color="#fff" size="28"></uni-icons>
      </view>
     <view class="company-title">{{list[current].enterpriseSimpleName}}【<text
          class="post-name">{{list[current].workTypeName}}.{{getRowsName(list[current].offerPrice, labelState.data?.enterprise_post_info_offer_price)}}</text>】</view>
      <uni-section title="签到安排" type="line" v-if="list[current].signLnglat && dayjs() <= dayjs(list[current].signTime).endOf('day')">
        <view class="table">
          <view class="row">
            <view class="td row-label">集合点</view>
            <view class="td flex3">
              {{getRowsName(list[current].gatherPoint, labelState.data?.enterprise_post_info_gather_point)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">入职材料</view>
            <view class="td flex3 ">
              {{getRowsName(recruitment?.inductionDetail, labelState.data?.enterprise_post_info_induction_detail)}}
			 <br>
			 {{recruitment?.inductionDetailAdd}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">面试安排</view>
            <!-- <view class="td flex3 ">{{recruitment?.interviewPlan}}</view> -->
            <view class="td flex3">{{getRowsName(recruitment?.interviewPlan, labelState.data?.enterprise_post_info_interview_plan, recruitment?.interviewPlanAdd)}}</view>
          </view>
          <view class="row">
            <view class="td row-label">签到地址</view>
            <view class="td flex3 left" @click="()=> handleNaviMap(list[current])">
              <uni-icons v-if="list[current].signLnglat" type="location-filled"></uni-icons>
              <text> {{list[current].signPosition}}</text>
            </view>
          </view>
          <view class="row">
            <view class="td row-label">安置员</view>
            <view class="td flex3">{{list[current].settlerName}}</view>
          </view>
          <view class="row">
            <view class="td row-label">安置员电话</view>
            <view class="td flex3" @click="()=> handlePhoneCall(list[current].settlerPhone)">
              <uni-icons v-if="list[current].settlerPhone" type="phone-filled"></uni-icons>
              <text>{{list[current].settlerPhone}}</text>
            </view>
          </view>
          <view class="row">
            <view class="td row-label">温馨提示</view>
            <rich-text class="td flex3 left"
              :nodes="formatRichText(list[current].placementDesc || placementDescDefault)"></rich-text>
          </view>
        </view>
      </uni-section>
      <uni-section title="招聘信息" type="line">
        <view class="table">
          <view class="row">
            <view class="td row-label">面试时间</view>
            <view class="td flex3">{{list[current].signTime ? dayjs(list[current].signTime).format('YYYY-MM-DD HH:mm') : ''}}</view>
            <!-- <view class="td flex3">{{formateDateTime(list[current].signTime)}}</view> -->
          </view>
          <view class="row">
            <view class="td row-label">类型</view>
            <view class="td flex3">
              {{getRowsName(list[current].positionType, labelState.data?.enterprise_post_info_post_type)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">企业简称</view>
            <view class="td flex3">{{list[current].enterpriseSimpleName}}</view>
          </view>
          <view class="row">
            <view class="td row-label">工种</view>
            <view class="td flex3">{{list[current].workTypeName}}</view>
          </view>
          <view class="row">
            <view class="td row-label">报价</view>
            <view class="td flex3">
              {{getRowsName(list[current].offerPrice, labelState.data?.enterprise_post_info_offer_price)}}
            </view>
          </view>


          <view class="row">
            <view class="td row-label">招聘政策</view>
            <rich-text class="td flex3 left" :nodes="formatRichText(list[current].recruitPolicy)"></rich-text>
          </view>
          <view class="row">
            <view class="td row-label">入职须知</view>
            <rich-text class="td flex3 left" :nodes="formatRichText(list[current].inductionNoticy)"></rich-text>
          </view>
          <view class="row">
            <view class="td row-label">体检</view>
            <view class="td flex3">
              {{getRowsName(recruitment?.bodyTest, labelState.data?.enterprise_post_info_body_test)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">姓名</view>
            <view class="td flex3">{{list[current].customerName}}</view>
          </view>
          <view class="row">
            <view class="td row-label">签到</view>
            <view class="td flex3">{{getRowsName(list[current].signState, signStatusArr)}}</view>
          </view>
          <view class="row">
            <view class="td row-label">面试</view>
            <view class="td flex3">{{getRowsName(list[current].interviewState, interviewStatusArr)}}</view>
          </view>
          <view class="row">
            <view class="td row-label">结算状态</view>
            <view class="td flex3">{{getRowsName(list[current].memeberState, memberSettleStatusArr)}}</view>
          </view>
          <view class="row">
            <view class="td row-label">金额</view>
            <view class="td flex3">{{list[current].memberAmount}}</view>
          </view>
          <view class="row">
            <view class="td row-label">结算备注</view>
            <view class="td flex3">{{list[current].memberDesc}}</view>
          </view>

        </view>
      </uni-section>
      <uni-section title="推荐费信息" type="line">
        <view class="table">
        <!--  <view class="row">
            <view class="td row-label">推荐费说明</view>
            <view class="td flex3">{{recruitment?.recommendFee}}</view>
          </view> -->
          <view class="row">
            <view class="td row-label">推荐人</view>
            <view class="td flex3">{{list[current].referenceName}}</view>
          </view>
          <view class="row">
            <view class="td row-label">本次标准</view>
            <rich-text class="td flex3 left" :nodes="formatRichText(list[current].referenceStandard)"></rich-text>
          </view>
          <view class="row">
            <view class="td row-label">结算状态</view>
            <view class="td flex3">{{list[current].referenceState}}</view>
          </view>
          <view class="row">
            <view class="td row-label">金额</view>
            <view class="td flex3">{{list[current].referenceAmount}}</view>
          </view>
          <view class="row">
            <view class="td row-label">结算备注</view>
            <view class="td flex3">{{list[current].referenceDesc}}</view>
          </view>
        </view>
      </uni-section>
    </view>
    <view class="contact" @click="showContact = true">
      <uni-icons type="chat-filled" color="#2979ff" size="20"></uni-icons>
      <text>咨询</text>
    </view>
    <contact-with-agent v-if="showContact" @close="showContact = false"></contact-with-agent>
  </view>
  <!-- <view v-if="list && list.length > 0" class="footer">
    <button class="feedback" @click="handleFeedback">问题反馈</button>
  </view> -->
</template>

<style scoped lang="scss">
  .replacement-page {
    padding-bottom: 150rpx;
  }

  .fixed-btn {
    position: fixed;
    bottom: 30vh;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 10;

    &.btn-left {
      left: 0;
    }

    &.btn-right {
      right: 0;
    }
  }

  .logo-container {
    padding-top: 20px;
    text-align: center;
  }

  .logo {
    width: 200px;
    height: 70px;
  }

  .empty-txt {
    margin-top: 100px;
    font-size: 15px;
    color: #888;
    text-align: center;
  }

  .company-title {
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    margin-top: 10px;
  }

  .post-name {
    color: red;
  }

  .table {
    border: 1px solid #333;
    color: #333;
    font-size: 14px;
    line-height: 1.3;
    margin: 0 10px;
  }

  .row {
    border-bottom: 1px solid #333;
    display: flex;

    &:last-child {
      border-bottom: none;
    }
  }

  .td {
    border-right: 1px solid #333;
    flex: 1;
    text-align: center;
    padding: 5px;

    &:last-child {
      border-right: none;
    }

    &.flex3 {
      flex: 3;
    }

    &.left {
      text-align: left;
    }
  }
  .contact {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    left: 24rpx;
    bottom: calc(var(--window-bottom) + 300rpx);
    width: 60px;
    height: 60px;
    color: #303133;
    font-size: 28rpx;
    background-color: #ffffff;
    box-shadow: 0 0 10rpx rgba(0, 0, 0, .2);
    border-radius: 50%;
  }

</style>
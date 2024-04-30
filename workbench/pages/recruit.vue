<template>
  <view class="page">
    <view class="search-bar">
      <recruit-search-form
        :labelData="labelState.data"
        @search="searchChange"
      />
    </view>
    <view v-if="state.rows?.length>0" class="list">
      <view v-for="item in state.rows" :key="item.recruitmentId" class="list-item" @click="()=> handleRoutePost(item)">
        <view class="list-item-header">
          <view class="check" :class="{active: item.check}" @click.stop="rowCheck(item)"></view>
          <view>
            <text class="list-item-title">{{item.enterpriseName}}</text>
            <text v-if="item.recruitmentState==='P'">招聘中</text>
            <text v-else-if="item.recruitmentState==='W'" class="red">待定</text>
            <text v-else-if="item.recruitmentState==='R'" class="red">暂停</text>
            <text v-else-if="item.recruitmentState==='A'" class="red">待审</text>
          </view>
        </view>
        <view class="list-item-gaps">
          <text class="list-item-gap"
            v-if="item.postType">{{getRowsName(item.postType, labelState.data?.enterprise_post_info_post_type)}}</text>
          <text class="list-item-gap"
            v-if="item.workType">{{getRowsName(item.workType, labelState.data?.enterprise_post_info_work_type)}}</text>
          <text v-if="item.offerPrice"
            class="list-item-gap-last">{{getRowsName(item.offerPrice, labelState.data?.enterprise_post_info_offer_price)}}</text>
          <view class="btns">
            <view class="list-item-btn" v-if="item.recruitmentState==='W'" @click.stop="rowApply(item)">提交审核</view>
            <button class="list-item-btn success" v-if="item.recruitmentState==='A' && userType === '0'" @click.stop="rowPass(item)">通过</button>
            <button class="list-item-btn danger" @click.stop="rowShare(item)">删除岗位</button>
          </view>
        </view>
        <view class="list-item-labels" v-if="getMuiltRowsName(item.postLight, labelState.data?.enterprise_post_info_post_light)">
          <text class="list-item-label" v-for="postLight in getMuiltRowsName(item.postLight, labelState.data?.enterprise_post_info_post_light)"
            :key="postLight">{{postLight}}</text>
        </view>
        <view class="list-item-content">
          <!-- <view v-if="item.recruitmentState === 'P'" class="list-item-content-line">招聘政策：<rich-text style="display: inline-block;" :nodes="formatRichText(item.recruitPolicy)"></rich-text> -->
          <view class="list-item-content-line">招聘政策：<rich-text style="display: inline-block;" :nodes="formatRichText(item.recruitPolicy)"></rich-text>
          </view>
          <view class="list-item-content-line">
            <text>{{item.genderNeed}}, </text>
            <text>男{{item.maleAge}}岁, 招{{item.maleNumber}}人, </text>
            <text>女{{item.femaleAge}}岁, 招{{item.femaleNumber}}人</text>
          </view>
          <!-- <view v-if="item.recruitmentState === 'P'" class="list-item-content-line">推荐费：{{item.recommendFee}}</view> -->
          <view class="list-item-content-line">推荐费：{{item.recommendFee}}</view>
          <view class="list-item-address-wrap">
            <image class="list-item-position-img" src="/static/position-fill.png"></image>
            <text
              class="list-item-address">{{getAddress([item.workProvince, item.workCity, item.workArea])}}{{item.workAddress}}</text>
          </view>
        </view>
      </view>
    </view>
    <data-empty v-else text="还未添加信息，请先查看其它页面"></data-empty>
    <view class="footer">
      <uni-data-checkbox multiple v-model="checkAll" style="flex: 1" :localdata="[{text: '全选', value: 1}]" @change="onCheckChange"></uni-data-checkbox>
      <view class="btns">
        <button class="btn" @click="handleBatchPass">通过</button>
        <button class="btn danger" @click="handleBatchDel">删除</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, watch } from 'vue';
import { onLoad, onShow } from "@dcloudio/uni-app";
import app from '../../utils/application';
import dayjs from 'dayjs'
import { useRequest, useListRequest } from '@/utils/hooks'
import { getRowsName, formatRichText } from '@/utils/index'
import { getAddress } from '@/utils/address'
import request from '../../utils/request';

  const userType = ref<string>(''); // 用户类型0-管理员, 1-经纪人

  onLoad(async (option) => {
    await app.login();
    const userRoleInfo = uni.getStorageSync('userRoleInfo');
    userType.value = userRoleInfo;
    uni.$on('updateRecruitList', () => {
      loadStart(query.value);
    });
  })

  const query = ref({
    offerPrice: '',
    workType: '',
    postLight: '',
    workProvince: '',
    workCity: '',
    workArea: '',
    recruitmentDate: dayjs().format('YYYY-MM-DD'),
  })

  const {
    state: labelState
  } = useRequest({
    url: '/system/dict/data/listAll',
    method: 'get',
    formatted: (res: any) => {
      const data: Record < string, Array < {
        key: string;name: string;
        value: string;text: string;
      } >> = {}

      if (Array.isArray(res)) {
        res.forEach((item: any) => {
          const key = `${item.dictType}`
          if (!data[key]) {
            data[key] = [{
              key: item.dictValue,
              name: item.dictLabel,
              value: item.dictValue,
              text: item.dictLabel
            }]
          } else {
            data[key].push({
              key: item.dictValue,
              name: item.dictLabel,
              value: item.dictValue,
              text: item.dictLabel
            })
          }
        })
      }
      return data;
    }
  })

  const {
    state,
    loadMore,
    loadStart
  } = useListRequest<any>({
    url: '/goods/recruitment/list',
    method: 'get',
    manual: true,
    defaultParams: {
      orderByColumn: 'recruitmentState',
      isAsc: 'desc'
    },
    rowKey: 'recruitmentId'
  })

  const handleRoutePost = (row) => {
    let url = `/workbench/pages/recruit-detail?recruitmentId=${row.recruitmentId}`;
    uni.navigateTo({ url });
  }

  const ids = computed(() => {
    return state.value?.rows?.filter((item) => item.check).map((item) => item.recruitmentId);
  })

  // 批量通过
  const handleBatchPass = () => {
    if (ids.value.length === 0) {
      uni.showToast({ title: '请选择要操作的数据', icon: 'none' });
      return;
    }
    uni.showModal({
      title: '提示',
      content: '确定批量通过吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/goods/recruitment/approveBatch',
            data: { recruitmentIdList: ids.value }
          }).then(() => {
            uni.showToast({ title: '批量通过成功', icon: 'none' });
            loadStart(query.value);
            checkAll.value = [];
          })
        }
      }
    })
  }

  // 批量删除
  const handleBatchDel = () => {
    if (ids.value.length === 0) {
      uni.showToast({ title: '请选择要操作的数据', icon: 'none' });
      return;
    }
    uni.showModal({
      title: '提示',
      content: '确定批量删除吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/goods/recruitment/deleteBatch',
            data: { recruitmentIdList: ids.value }
          }).then(() => {
            uni.showToast({ title: '批量删除成功', icon: 'none' });
            loadStart(query.value);
            checkAll.value = [];
          })
        }
      }
    })
  }

  const rowPass = (row) => {
    request({
      url: '/goods/recruitment/approve',
      data: {
        recruitmentId: row.recruitmentId
      }
    }).then(() => {
      uni.showToast({ title: '审核成功', icon: 'none' });
      loadStart(query.value);
    })
  }

  const rowShare = (row) => {
    uni.showModal({
      title: '提示',
      content: '确定删除该岗位吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: '/goods/recruitment/delete',
            data: {
              recruitmentId: row.recruitmentId
            }
          }).then(() => {
            uni.showToast({ title: '删除成功', icon: 'none' });
            loadStart(query.value);
          })
        }
      }
    })
  }

  // 提交审核
  const rowApply = (row) => {
    request({
      url: '/goods/recruitment/submit',
      data: {
        recruitmentId: row.recruitmentId
      }
    }).then(() => {
      uni.showToast({ title: '提交成功', icon: 'none' });
      loadStart(query.value);
    })
  }

  const checkAll = ref([]);
  const onCheckChange = (e) => {
    if (e.detail.value.length === 0) {
      state.value?.rows?.forEach((item) => {
        item.check = false;
      });
    } else {
      state.value?.rows?.forEach((item) => {
        item.check = true;
      });
    }
  };

  const rowCheck = (row) => {
    row.check = !row.check;
  }

  const searchChange = (params: any) => {
    query.value = params;
    loadStart(params)
  }

  const getMuiltRowsName = (rows, dict) => {
    const names = Array<string>();
    if (!rows || rows.length < 1) {
      return '';
    }
    const splitRows = rows.split(',');
    splitRows.forEach((item: string) => {
      names.push(getRowsName(item, dict));
    });
    return names;
  }
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    padding-bottom: 120rpx;
    background-color: #f5f5f5;
    .search-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 12rpx 24rpx;
      z-index: 100;
      background-color: #fff;
      box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.05);
    }
  }

  .current-city {
    min-width: 80px;
    height: 56px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .list {
    position: relative;
    padding: 120rpx 24rpx 24rpx;
  }

  .list-item {
    margin-bottom: 10px;
    padding: 10px;
    font-size: 12px;
    color: #333;
    line-height: 1.5;
    border-radius: 10rpx;
    box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.05);
    background-color: #fff;
  }

  .list-item-header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    .check {
      position: relative;
      width: 36rpx;
      height: 36rpx;
      margin-right: 12rpx;
      border: 1px solid #ccc;
      border-radius: 50%;
      &.active {
        background-color: $uni-primary;
        border-color: $uni-primary;
        &::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          height: 8px;
          width: 4px;
          border-right-width: 2px;
          border-right-color: #fff;
          border-right-style: solid;
          border-bottom-width: 2px;
          border-bottom-color: #fff;
          border-bottom-style: solid;
          transform: translate3d(-50%, -55%, 0) rotate(45deg);
        }
      }
    }
  }

  .list-item-companyname {
    font-weight: bold;
    font-size: 16px;
    line-height: 2;
  }

  .list-item-btn {
    // border: 1px solid $uni-primary;
    // color: $uni-primary;
    text-align: center;
    padding: 2px 12px;
    border-radius: 12px;
  }

  .list-item-title {
    font-size: 14px;
    font-weight: bold;
    margin-right: 10px;
  }

  .list-item-gaps {
    position: relative;
    line-height: 1.2;
    .btns {
      position: absolute;
      top: -56rpx;
      right: 0rpx;
      display: flex;
      align-items: center;
      .list-item-btn {
        height: 48rpx;
        line-height: 48rpx;
        padding: 0 16rpx;
        color: #fff;
        font-size: 24rpx;
        background-color: #2979ff;
        border-radius: 8rpx;
        box-sizing: border-box;
        &.success {
          background-color: #1aad19;
        }
        &.danger {
          background-color: #fe1e3f;
        }
        &.disabled {
          background-color: #ccc;
          border-color: #ccc;
          color: #606266;
        }
        &:not(:last-child) {
          margin-right: 10px;
        }
        &::after {
          border: none;
        }
      }
    }
  }

  .list-item-gap {
    padding: 0 10px;
    border-right: 1px solid #ccc;
  }

  .list-item-gap-last {
    margin-left: 10px;
  }

  .list-item-label {
    display: inline-block;
    margin-top: 16rpx;
    color: #2979ff;
    background-color: rgb(41, 121, 255, 0.1);
    border: 1px solid #2979ff;
    border-radius: 4rpx;
    margin-right: 5px;
    padding: 0 8rpx;
  }

  .list-item-content-line {
    margin: 5px 0;
  }

  .list-item-address-wrap {
    margin: 5px 0;
    display: flex;
    align-items: center;
  }

  .list-item-position-img {
    width: 16px;
    min-width: 16px;
    height: 16px;
    margin-right: 3px;
  }

  .list-item-address {
    color: #888;
  }
  .footer {
    display: flex;
    padding-bottom: 32rpx;
    .btns {
      display: flex;
      align-items: center;
      .btn {
        flex: 1;
        padding: 0 48rpx;
        height: 72rpx;
        line-height: 72rpx;
        font-size: 28rpx;
        color: #fff;
        background-color: #1aad19;
        &::after {
          border: none;
        }
        &.danger {
          background-color: #fe1e3f;
        }
        & + .btn {
          margin-left: 10px;
        }
      }
    }
  }

</style>

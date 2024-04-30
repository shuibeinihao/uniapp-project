<script setup lang="ts">
  import {
    ref
  } from "vue"
  import {
    useRequest
  } from "../../utils/hooks"
  import {
    getRowsName,
    formatRichText
  } from '@/utils'
  import app from "../../utils/application";

  const recruitmentStateOpts = [{
    key: 'P',
    name: '招聘中'
  },
  {
    key: 'W',
    name: '待定'
  },
  {
    key: 'R',
    name: '暂停'
  },
  ]

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

  const pkList = ref(app.globalData.get('pk_list') || [])

  console.log('pkList', pkList.value)

  const isHorizontal = ref(uni.getStorageSync('isHorizontal') === '1')

  const applyModal = ref({
    show: false,
    post: null,
    workTypeName: ''
  })


  const handleDirectionClick = () => {
    let bol = isHorizontal.value;
    isHorizontal.value = !bol;
    uni.setStorageSync('isHorizontal', bol ? '0' : '1')
  }
  const handleDelete = (recruitmentId : string) => {
    const newList = pkList.value.filter(item => item.recruitmentId !== recruitmentId);
    app.globalData.set('pk_list', [...newList])
    pkList.value = newList;
  }

  const handleApply = (post) => {
    app.getUserInfo(false, true).then(res => {
      const workTypeName = getRowsName(post.workType, labelState.value.data?.enterprise_post_info_work_type)

      applyModal.value = {
        show: true,
        post,
        workTypeName
      }
    })
  }
</script>

<template>
  <position-apply-modal v-if="applyModal.show" :post="applyModal.post" :workTypeName="applyModal.workTypeName"
    @close="applyModal.show = false"
    :gatherPointData="labelState.data?.enterprise_post_info_gather_point"></position-apply-modal>
  <custom-navigation-bar title="PK对比" fixed :horizontal="isHorizontal"></custom-navigation-bar>
  <view class="fixed-icon"
    :style="isHorizontal ? { botttom: 'initial', top: '100px', transform: 'rotate(-90deg)' } : {}"
    @click="handleDirectionClick">
    <image class="fixed-icon-img" src="../../static/direction_change.png"></image>
  </view>
  <view class="container"
    :style="isHorizontal ? {width: '100vh', height: '100vw', transform: 'rotate(-90deg) translate(-100vh, 0)', transformOrigin: '10px 0'} : {}">

    <view class="list-container" v-if="pkList && pkList.length > 0"
      :style="{width: 100 + (isHorizontal ? 250 : 200) *pkList.length + 'px' }">
      <view class="pk-header">
        <view class="pk-header-label">综合对比：</view>
        <view class="pk-header-item" v-for="post in pkList" :key="post.recruitmentId">
          <view class="pk-header-item-box" @click="handleDelete(post.recruitmentId)">
            <view class="pk-header-item-title">{{post.enterpriseName}}</view>
            <view class="pk-header-item-subtitle">
              {{getRowsName(post.workType, labelState.data?.enterprise_post_info_work_type)}}
            </view>
            <uni-icons class="pk-header-close" type="close" size="23"></uni-icons>
          </view>
          <button :disabled="!post.recruitmentId" class="apply-btn" @click="handleApply(post)">立即报名</button>
        </view>
      </view>
      <view class="post-detail">
        <uni-section title="招聘信息" type="line">
          <view class="table">
            <view class="row">
              <view class="td row-label">招聘状态</view>
              <view class="td red flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.recruitmentState, recruitmentStateOpts)}}

              </view>
            </view>
            <!-- <view class="row">
           <view class="td row-label">面试日期</view>
           <view class="td">2022-09-09</view>
         </view> -->
            <view class="row">
              <view class="td row-label">企业简称</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">{{post.enterpriseName}}</view>
            </view>
            <view class="row">
              <view class="td row-label">面试日期</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{post.recruitmentDate}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">类型</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.postType, labelState.data?.enterprise_post_info_post_type)}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">工种</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.workType, labelState.data?.enterprise_post_info_work_type)}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">报价</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.offerPrice, labelState.data?.enterprise_post_info_offer_price)}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">岗位亮点</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.postLight, labelState.data?.enterprise_post_info_post_light)}}

              </view>
            </view>
            <view class="row">
              <view class="td row-label">招聘政策</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                <rich-text :nodes="formatRichText(post.recruitPolicy)"></rich-text>
              </view>
            </view>
            <view class="row">
              <view class="td row-label">入职须知</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                <rich-text :nodes="formatRichText(post.inductionNoticy)"></rich-text>
              </view>
            </view>
          </view>
        </uni-section>
        <uni-section title="岗位要求" type='line'>
          <view class="table">
            <view class="row">
              <view class="td row-label">性别要求</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">{{post.genderNeed}}</view>
            </view>
            <view class="row">
              <view class="td row-label">男性人数</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">{{post.maleNumber}}</view>
            </view>
            <view class="row">
              <view class="td row-label">男性年龄</view>
              <view class="td" v-for="post in pkList" :key="post.recruitmentId">{{post.maleAge}}</view>
            </view>
            <view class="row">
              <view class="td row-label">女性人数</view>
              <view class="td" v-for="post in pkList" :key="post.recruitmentId">{{post.femaleNumber}}</view>
            </view>
            <view class="row">
              <view class="td row-label">女性年龄</view>
              <view class="td" v-for="post in pkList" :key="post.recruitmentId">{{post.femaleAge}}</view>
            </view>
            <!-- <view class="row">
           <view class="td row-label">面试安排</view>
           <view class="td">14:00-18:00</view>
         </view> -->
            <view class="row">
              <view class="td row-label">入职材料</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.inductionDetail, labelState.data?.enterprise_post_info_induction_detail)}}
              </view>
            </view>
          </view>
        </uni-section>
        <uni-section title="工作信息" type='line'>
          <view class="table">

            <view class="row">
              <view class="td row-label">工作内容</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                <rich-text :nodes="formatRichText(post.workContent)"></rich-text>
              </view>
            </view>
            <view class="row">
              <view class="td row-label">作业环境</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.operationEnv, labelState.data?.enterprise_post_info_operation_env)}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">工作地址</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">{{post.workAddress}}</view>
            </view>
            <view class="row">
              <view class="td row-label">住</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.live, labelState.data?.enterprise_post_info_live)}}{{post.liveAdd?.trim() ? ` (${post.liveAdd})` :''}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">吃</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.eat, labelState.data?.enterprise_post_info_eat)}}{{post.eatAdd?.trim() ? ` (${post.eatAdd})` :''}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">着装</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.clothing, labelState.data?.enterprise_post_info_clothing)}}{{post.clothingAdd?.trim() ? ` (${post.clothingAdd})` :''}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">排班</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.rostering, labelState.data?.enterprise_post_info_rostering)}}{{post.rosteringAdd?.trim() ? ` (${post.rosteringAdd})` :''}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">学历</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.education, labelState.data?.enterprise_post_info_education)}}{{post.educationAdd?.trim() ? ` (${post.educationAdd})` :''}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">户籍</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.domicile, labelState.data?.enterprise_post_info_domicile)}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">民族</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.nation, labelState.data?.enterprise_post_info_nation)}}{{post.nationAdd?.trim() ? ` (${post.nationAdd})` :''}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">纹身</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.tattoo, labelState.data?.enterprise_post_info_tattoo)}}{{post.tattooAdd?.trim() ? ` (${post.tattooAdd})` :''}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">体检</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.bodyTest, labelState.data?.enterprise_post_info_body_test)}}{{post.bodyTestAdd?.trim() ? ` (${post.bodyTestAdd})` :''}}
              </view>
            </view>
            <view class="row">
              <view class="td row-label">工作经验</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                <rich-text :nodes="formatRichText(post.workExperience)"></rich-text>
              </view>
            </view>
            <view class="row">
              <view class="td row-label">复职条件</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                <rich-text :nodes="formatRichText(post.officeCondition)"></rich-text>
              </view>
            </view>
            <!-- #ifndef MP-KUAISHOU -->
            <view class="row">
              <view class="td row-label">推荐费</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{post.recommendFee}}
              </view>
            </view>
            <!-- #endif -->
            <view class="row">
              <view class="td row-label">保险方案</view>
              <view class="td flex3" v-for="post in pkList" :key="post.recruitmentId">
                {{getRowsName(post.insuranceScheme, labelState.data?.enterprise_post_info_insurance_scheme)}}{{post.insuranceSchemeAdd?.trim() ? ` (${post.insuranceSchemeAdd})` :''}}
              </view>
            </view>
          </view>
        </uni-section>
      </view>
    </view>
    <data-empty v-else text="还未添加招聘信息"></data-empty>
  </view>
</template>


<style scoped lang="scss">
  .container {
    padding-top: 75px;
    padding-bottom: 70px;
    box-sizing: border-box;
    height: 100vh;
    overflow: auto;
  }

  .fixed-icon {
    position: fixed;
    right: 30px;
    bottom: 100px;
    background-color: #fff;
    box-shadow: 0 0 6px 4px rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
  }

  .fixed-icon-img {
    width: 26px;
    height: 26px;
    opacity: .5;
  }

  .empty {
    min-height: 100vh;
    background-color: #f5f5f5;
  }


  .header {
    margin: 15px;
  }

  .header-title {
    font-size: 18px;
    color: #000;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-row {
    margin-top: 5px;
  }


  .body {
    padding: 10px 15px;
    font-size: 16px;
  }

  .day-switch {
    display: flex;
    margin: 0 15px;
    border-radius: 5px;
    overflow: hidden;
  }

  .day-switch-item {
    flex: 1;
    background-color: #ddd;
    text-align: center;
    padding: 5px;
    font-size: 14px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-right: 1px solid #f2f2f2;

    &:last-child {
      border-right-width: 0;
    }

    &.current {
      background-color: $uni-primary;
      color: #fff;
    }
  }

  .post-list {
    margin: 12px 15px;
    display: flex;
    gap: 10px;
  }

  .post-list-item {
    padding: 5px 8px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 3px;
    text-align: center;
    font-size: 12px;
    color: #666;

    &.current {
      background-color: $uni-primary;
      color: #fff;
    }
  }


  .table {
    margin: 0 15px 10px 15px;
    border: 1px solid #888;
    box-sizing: border-box;
  }

  .row {
    display: flex;
    line-height: 1.5;
    box-sizing: border-box;
    // &:nth-child(odd) {
    //   background-color: #d2deef;
    // }

    // &:nth-child(even) {
    //   background-color: #EAEFF7;
    // }
    border-bottom: 1px solid #888;

    &:last-child {
      border-bottom: 0;
    }
  }

  .td {
    flex: 1;
    padding: 4px 2px;
    border-right: 1px solid #888;
    word-break: break-all;
    box-sizing: border-box;

    &:last-child {
      border-color: transparent;
    }
  }

  .td.flex3 {
    flex: 3;
  }

  .td.row-label {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: none;
    min-width: 100px;
  }

  .pk-header {
    display: flex;
    line-height: 1.5;
    box-sizing: border-box;
    margin: 20px 15px 10px 15px;
    border: 1px solid #fff;
  }

  .pk-header-label {
    flex: 1;
    padding: 4px 2px;
    border-right: 1px solid #fff;
    word-break: break-all;
    box-sizing: border-box;
    line-height: 50px;
    flex: none;
    min-width: 100px;
  }

  .apply-btn {
    background-color: $uni-primary;
    color: #fff;
    height: 34px;
    line-height: 34px;
    margin-top: 10px;
  }

  .pk-header-item {
    flex: 1;
    padding: 4px 2px;
    border-right: 1px solid #fff;
    word-break: break-all;
    box-sizing: border-box;
  }

  .pk-header-item-box {
    background-color: #f2f2f2;
    border-radius: 5px;
    padding: 5px;
    position: relative;
    font-size: 14px;

  }

  .pk-header-close {
    position: absolute;
    right: 8px;
    top: 0px;
  }

  .pk-header-item-title {
    color: #888;

  }

  .pk-header-item-subtitle {
    color: #333;
    font-weight: bold;
    font-size: 15px;
  }
</style>
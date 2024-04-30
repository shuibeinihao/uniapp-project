<script setup lang="ts">
  import {
    onLoad,
    onShow
  } from "@dcloudio/uni-app";
  import {
    reactive,
    ref,
    watch
  } from "vue";
  import {
    useRequest
  } from "@/utils/hooks";
  import request from "@/utils/request";
  import {
    getRowsName,
    getCompanyWeek,
    formatRichText
  } from '@/utils'
  import {
    getAddress
  } from '@/utils/address'
  import app from "@/utils/application";
  import dayjs from "dayjs";
  import { doReferrerInfo } from "../../services/api";

  const isLoaded = ref(false)

  const currentPost = ref()

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

  const launchOption = uni.getLaunchOptionsSync()

  let pageQuery : Record<string, string> = launchOption.query || {};

  const referrerId = ref<string>(''); // 推荐人id

  onLoad(async (query) => {
	  // currentSelect.value = '1'
    pageQuery = query;
    const refId = query.scene ? decodeURIComponent(query.scene) : undefined;
	  console.log("referrerid:",query.referrerId)
    referrerId.value = query.referrerId || refId;
    const launchOption = uni.getLaunchOptionsSync()
    if (launchOption.scene !== 1154) {
      await app.login();
    }
    doReferrerInfo(referrerId.value)
    if (query.enterpriseId) {
      if (query.tabValue) { // // 1今天 2明天 3岗位列表
        currentSelect.value = query.tabValue;
      } else {
        currentSelect.value = '1'
      }
      app.getUserInfo().then(res => {
        const page = getCurrentPages();
        page[page.length - 1].onShareAppMessage = () => {
          let recruitmentId = currentPost.value?.recruitmentId;
          let postId = recruitmentId ? '' : currentPost.value?.postId;		
	
          return {
            title: decodeURIComponent(query.enterpriseName),
            path: `/pages/company/index?enterpriseId=${query.enterpriseId}&enterpriseName=${query.enterpriseName}&tabValue=${currentSelect.value}&recruitmentId=${recruitmentId || ''}&postId=${postId || ''}&referrerId=${res.customerId}`
          }
		 
        }
        // #ifdef MP-WEIXIN
        page[page.length - 1].onShareTimeline = () => {
          let recruitmentId = currentPost.value?.recruitmentId;
          let postId = recruitmentId ? '' : currentPost.value?.postId;	
          return {
            title: decodeURIComponent(query.enterpriseName),
            query: `enterpriseId=${query.enterpriseId}&enterpriseName=${query.enterpriseName}&tabValue=${currentSelect.value}&recruitmentId=${recruitmentId || ''}&postId=${postId || ''}&referrerId=${res.customerId}`
          }
        }
        // #endif
      }).catch(() => { })

      request({
        url: '/goods/enterprise/getInfoById',
        method: 'get',
        data: {
          enterpriseId: query.enterpriseId
        }
      }).then(res => {
        isLoaded.value = true;
        const data = res.data
        if (data) {
          companyInfo.value = {
            ...data,
            pictureList: data.pictures ? data.pictures.split(',') : null
          }
        }
      })
      uni.setNavigationBarTitle({
        title: decodeURIComponent(query.enterpriseName)
      })
    } else {
      isLoaded.value = true;
    }
  })

  const postListObj = reactive<Record<string,
    any[]>>({})

  const currentSelect = ref('0') // 1今天 2明天 3岗位列表

  watch(currentSelect, (curVal, prev) => {
    if (postListObj[curVal]) {
      currentPost.value = postListObj[curVal][0]
      return;
    };

    uni.showLoading({
      title: 'loading...'
    })
    if (curVal === '3') {
      request({
        url: '/goods/enterprisepost/list',
        method: 'get',
        data: {
          enterpriseId: pageQuery.enterpriseId,
          postStatus: 'E'
        }
      }).then(res => {
        uni.hideLoading()
        const data = res.rows || []
        postListObj['3'] = data.map(item => {
          item.recruitmentDate = item.recruitmentDateList?.join(',');
          return item;
        });
        const queryTarget = pageQuery.postId && data.find(item => item.postId === pageQuery.postId);
        currentPost.value = queryTarget || data[0];
      }).catch((err) => {
        uni.showToast({
          title: err?.message,
          icon: 'none'
        })
      })
    } else {
      request({
        url: '/goods/recruitment/list',
        method: 'get',
        data: {
          enterpriseId: pageQuery.enterpriseId,
          recruitmentDate: dayjs().add(curVal === '1' ? 0 : 1, 'd').format('YYYY-MM-DD')
        }
      }).then(res => {
        uni.hideLoading()
        const data = res.rows || []
        postListObj[curVal] = data;
        const queryTarget = pageQuery.recruitmentId && data.find(item => item.recruitmentId === pageQuery.recruitmentId);
        currentPost.value = queryTarget || data[0];
      }).catch((err) => {
        uni.showToast({
          title: err?.message,
          icon: 'none'
        })
      })
    }
  }, { flush: 'post' })

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

  const companyInfo = ref<any>()


  const pkList = ref([])

  onShow(() => {
    pkList.value = app.globalData.get('pk_list') || [];
  })

  const handleClickPK = (postInfo : any) => {
    const list = pkList.value;
    if (list.every(item => item.recruitmentId !== postInfo.recruitmentId)) {
      list.push(postInfo)
    }
    app.globalData.set('pk_list', [...list])
  }

  const applyModal = ref({
    show: false,
    post: null,
    workTypeName: '',
    referrerId: ''
  })

  const handleApply = (post) => {
    app.getUserInfo(false, true, true).then((res) => {
      const workTypeName = getRowsName(post.workType, labelState.value.data?.enterprise_post_info_work_type)
      if (!res || !res.customerName || !res.verify || res.verify !== 'T') {
        return;
      }
      applyModal.value = {
        show: true,
        post,
        workTypeName,
        referrerId: referrerId.value
      }
    }).catch(err => { })
  }

  const handlePhoneCall = () => {
    app.getUserInfo().then(res => {
      uni.makePhoneCall({
        phoneNumber: res.agentPhone || '400 880 1090',
      })
    })
  }

  const handleRoutePk = () => {

    const list = pkList.value;
    if (currentPost.value?.recruitmentId && list.every(item => item.recruitmentId !== currentPost.value.recruitmentId)) {
      list.push(currentPost.value)
    }
    app.globalData.set('pk_list', [...list])
    uni.navigateTo({
      url: '/pages/company/pk'
    })
  }

  const previewImg = (url) => {
    uni.previewImage({
      current: url,
      urls: companyInfo.value.pictureList
    })
  }

  const {state: switchState } = useRequest({
    url: '/system/config/configKey/mini.review.switch',
    method: 'get'
  })
  const showContact = ref(false);

  const currentTime = ref(0);
  const timeupdate = (e) => {
    currentTime.value = e.detail.currentTime;
  }

  const videoContext = uni.createVideoContext('myvideo', this);
  const originVideo = uni.createVideoContext('originVideo', this);
  const muted = ref(true);
  const videoClick = () => {
    // videoContext.requestFullScreen({direction: 0});  //direction: 90  这个是控制全屏的时候视屏旋转多少度 
    // videoContext.play();
    // videoplay.value = true;
  }

  const onEnded = () => {
    videoplay.value = false;
    currentTime.value = 0;
    originVideo.pause();
  }

  const videoplay = ref(false);

  const screenChange = (e) => {
    const { fullScreen } = e.detail;
    if (!fullScreen) {
      videoplay.value = false;
      if (currentTime.value) {
        originVideo.seek(currentTime.value);
        originVideo.play();
      }
    }
  }
</script>

<template>
  <position-apply-modal v-if="applyModal.show" :post="applyModal.post" :workTypeName="applyModal.workTypeName"
    :gatherPointData="labelState.data?.enterprise_post_info_gather_point" :referrerId="applyModal.referrerId"
    @close="applyModal.show = false"></position-apply-modal>
  <view v-if="companyInfo" class="company-container">
    <swiper v-if="companyInfo.pictureList" class="swiper" circular indicator-dots :autoplay="!companyInfo.videos" :interval="2000"
      :duration="500">
      <swiper-item v-if="companyInfo.videos && switchState?.data?.msg !== '1'">
        <video id="originVideo" class="swiper-item" :muted="muted" show-mute-btn :src="companyInfo.videos" autoplay controls @click="videoClick" @timeupdate="timeupdate" @ended="onEnded"></video>
      </swiper-item>
      <swiper-item v-for="picUrl in companyInfo.pictureList" :key="picUrl">
        <image class="swiper-item" :src="picUrl" @click="previewImg(picUrl)" />
      </swiper-item>
    </swiper>
    <view class="header">
      <view class="header-title ">
        {{companyInfo.abbreviationName}}
      </view>
      <view class="header-row color-red">
        {{ getRowsName(companyInfo.industryType, labelState.data?.enterprise_info_industry_type) }}, {{ getRowsName(companyInfo.enterpriseType, labelState.data?.enterprise_info_enterprise_type) }}, {{ getRowsName(companyInfo.enterpriseScale, labelState.data?.enterprise_info_enterprise_scale) }}
      </view>
      <view class="header-row address">
        <uni-icons type="location-filled" size="21" color="#a2a2a2"></uni-icons>
        {{getAddress([companyInfo.province, companyInfo.city, companyInfo.area])}}{{companyInfo.address}}
      </view>
    </view>
    <view class="day-switch">
      <view :class="['day-switch-item', {current: currentSelect === '1'}]" @click="currentSelect='1'">
        <view>
          <view>今天面试</view>
          <view>{{getCompanyWeek(dayjs())}}</view>

        </view>
      </view>
      <view :class="['day-switch-item', {current: currentSelect === '2'}]" @click=" currentSelect='2'">
        <view>
          <view>明天面试</view>
          <view>{{getCompanyWeek(dayjs().add(1, 'd'))}}</view>
        </view>
      </view>
      <view :class="['day-switch-item', {current: currentSelect === '3'}]" @click="currentSelect='3'">
        <view>
          岗位列表
        </view>
      </view>
    </view>
    <view class="post-list" v-if="postListObj[currentSelect]">
      <view
        :class="['post-list-item', {current: currentSelect === '3' ? currentPost?.postId === item.postId : currentPost?.recruitmentId == item.recruitmentId}]"
        v-for="item in postListObj[currentSelect]" :key="item.recruitmentId || item.postId "
        @click="()=> currentPost=item">
        <view>
          {{switchState?.data?.msg === '1' ? '包装工' : getRowsName(item.workType, labelState.data?.enterprise_post_info_work_type)}}
        </view>
        <view>
          {{getRowsName(item.offerPrice, labelState.data?.enterprise_post_info_offer_price) }}
        </view>
      </view>
    </view>
    <view class="post-detail" v-if="currentPost">
      <uni-section title="招聘信息" type="line">
        <template v-slot:right>
          <!-- <custom-button v-if="currentSelect !== '3' && currentPost.recruitmentState === 'P'" class="btn" size="mini"
            :disabled="pkList.some(item=> item.recruitmentId == currentPost.recruitmentId)"
            @click="handleClickPK(currentPost)">
            PK
          </custom-button> -->
          <custom-button v-if="currentSelect !== '3'" class="btn" size="mini"
            :disabled="pkList.some(item=> item.recruitmentId == currentPost.recruitmentId)"
            @click="handleClickPK(currentPost)">
            PK
          </custom-button>
          <custom-button v-if="currentSelect !== '3' " class="btn" size="mini"
            type="primary" @click="()=> handleApply(currentPost)">立即报名</custom-button>
        </template>
        <view class="table">
          <view class="row" v-if="currentSelect !== '3'">
            <view class="td row-label">招聘状态</view>
            <view class="td red flex3">
              {{getRowsName(currentPost.recruitmentState, recruitmentStateOpts)}}

            </view>
          </view>
          <view class="row">
            <view class="td row-label">面试日期</view>
            <view class="td flex3">{{currentPost.recruitmentDate || '等通知'}}</view>
          </view>
          <view class="row">
            <view class="td row-label">类型</view>
            <view class="td flex3">
              {{switchState?.data?.msg === '1' ? '代招' : getRowsName(currentPost.postType, labelState.data?.enterprise_post_info_post_type)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">企业简称</view>
            <view class="td flex3">{{currentPost.enterpriseName}}</view>
          </view>
          <view class="row" v-if="switchState?.data?.msg === '1'">
            <view class="td row-label">企业全称</view>
            <view class="td flex3">{{companyInfo?.enterpriseName}}</view>
          </view>
          <view class="row">
            <view class="td row-label">工种</view>
            <view class="td flex3">
              {{switchState?.data?.msg === '1' ? '包装工' : getRowsName(currentPost.workType, labelState.data?.enterprise_post_info_work_type)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">报价</view>
            <view class="td flex3">
              {{getRowsName(currentPost.offerPrice, labelState.data?.enterprise_post_info_offer_price)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">岗位亮点</view>
            <view class="td flex3">
              {{getRowsName(currentPost.postLight, labelState.data?.enterprise_post_info_post_light)}}
            </view>
          </view>
          <view class="row" v-if="switchState?.data?.msg === '1'">
            <view class="td row-label">岗位收费</view>
            <view class="td flex3">不收费</view>
          </view>
          <!-- <view class="row" v-if="currentSelect !== '3' && currentPost.recruitmentState === 'P'"> -->
          <view class="row">
            <view class="td row-label">招聘政策</view>
            <view class="td flex3">
              <!-- {{currentPost.recruitPolicy)}} -->
              <rich-text :nodes="formatRichText(currentPost.recruitPolicy)"></rich-text>
            </view>
          </view>
          <!-- <view class="row" v-if="currentSelect !== '3' && currentPost.recruitmentState === 'P'"> -->
          <view class="row">
            <view class="td row-label">入职须知</view>
            <view class="td flex3">
              <rich-text :nodes="formatRichText(currentPost.inductionNoticy)"></rich-text>
            </view>
          </view>
          <view class="row">
            <view class="td row-label">保险方案</view>
            <view class="td flex3">
              {{getRowsName(currentPost.insuranceScheme, labelState.data?.enterprise_post_info_insurance_scheme)}}
            </view>
          </view>
          <!-- <view class="row" v-if="currentSelect !== '3' && currentPost.recruitmentState === 'P'"> -->
          <!-- #ifndef MP-KUAISHOU -->
          <view class="row" v-if="currentSelect !== '3'">
            <view class="td row-label">推荐费</view>
            <view class="td flex3">{{currentPost.recommendFee}}</view>
          </view>
          <!-- #endif -->
        </view>
      </uni-section>
      <uni-section title="岗位要求" type='line'>
        <view class="table">
          <view class="row" v-if="currentSelect !== '3'">
            <view class="td row-label">性别要求</view>
            <view class="td flex3">{{currentPost.genderNeed}}</view>
          </view>
          <view class="row">
            <view class="td row-label">男性年龄</view>
            <view class="td flex3">{{currentPost.maleAge}}</view>
          </view>
          <view class="row" v-if="currentSelect !== '3'">
            <view class="td row-label">男性人数</view>
            <view class="td flex3">{{currentPost.maleNumber}}</view>
          </view>
          <view class="row">
            <view class="td row-label">女性年龄</view>
            <view class="td flex3">{{currentPost.femaleAge}}</view>
          </view>
          <view class="row" v-if="currentSelect !== '3'">
            <view class="td row-label">女性人数</view>
            <view class="td flex3">{{currentPost.femaleNumber}}</view>
          </view>
          <view class="row">
            <view class="td row-label">面试安排</view>
            <view class="td">{{getRowsName(currentPost.interviewPlan, labelState.data?.enterprise_post_info_interview_plan, currentPost.interviewPlanAdd)}}</view>
          </view>
          <view class="row">
            <view class="td row-label">入职材料</view>
            <view class="td flex3">
              {{getRowsName(currentPost.inductionDetail, labelState.data?.enterprise_post_info_induction_detail, currentPost.inductionDetailAdd)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">体检</view>
            <view class="td flex3">
              {{getRowsName(currentPost.bodyTest, labelState.data?.enterprise_post_info_body_test, currentPost.bodyTestAdd)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">户籍/民族</view>
            <view v-if="switchState?.data?.msg === '1'" class="td flex3">不限</view>
            <view v-else class="td flex3">
              {{ getRowsName(currentPost.nation, labelState.data?.enterprise_post_info_nation, currentPost.nationAdd) }}
            </view>
          </view>
          <!-- <view class="row">
            <view class="td row-label">民族</view>
            <view class="td flex3">
              {{getRowsName(currentPost.nation, labelState.data?.enterprise_post_info_nation, currentPost.nationAdd)}}
            </view>
          </view> -->
          <view class="row">
            <view class="td row-label">纹身</view>
            <view class="td flex3">
              {{getRowsName(currentPost.tattoo, labelState.data?.enterprise_post_info_tattoo, currentPost.tattooAdd)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">学历</view>
            <view class="td flex3">
              {{getRowsName(currentPost.education, labelState.data?.enterprise_post_info_education, currentPost.educationAdd)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">工作经验</view>
            <view class="td flex3">
              <rich-text :nodes="formatRichText(currentPost.workExperience)"></rich-text>
            </view>
          </view>
          <view class="row">
            <view class="td row-label">复职条件</view>
            <view class="td flex3">
              <rich-text :nodes="formatRichText(currentPost.officeCondition)"></rich-text>
            </view>
          </view>
        </view>
      </uni-section>
      <uni-section title="其他信息" type='line'>
        <view class="table">
          <view class="row">
            <view class="td row-label">工作地址</view>
            <view class="td flex3">
              {{getAddress([currentPost.workProvince, currentPost.workCity, currentPost.workArea])}}{{currentPost.workAddress}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">住</view>
            <view class="td flex3">
              {{getRowsName(currentPost.live, labelState.data?.enterprise_post_info_live, currentPost.liveAdd)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">吃</view>
            <view class="td flex3">
              {{getRowsName(currentPost.eat, labelState.data?.enterprise_post_info_eat, currentPost.eatAdd)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">工作内容</view>
            <view class="td flex3">
              <view v-if="switchState?.data?.msg === '1'">充填，包装以及简单的加工</view>
              <rich-text v-else="currentPost.workContent" :nodes="formatRichText(currentPost.workContent)"></rich-text>
            </view>
          </view>
          <view class="row">
            <view class="td row-label">作业环境</view>
            <view class="td flex3">
              {{getRowsName(currentPost.operationEnv, labelState.data?.enterprise_post_info_operation_env, currentPost.operationEnvAdd)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">着装</view>
            <view class="td flex3">
              {{getRowsName(currentPost.clothing, labelState.data?.enterprise_post_info_clothing, currentPost.clothingAdd)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">作业姿态</view>
            <view class="td flex3">
              {{getRowsName(currentPost.operationPose, labelState.data?.enterprise_post_info_operation_pose, currentPost.operationPoseAdd)}}
            </view>
          </view>
          <view class="row">
            <view class="td row-label">排班</view>
            <view class="td flex3">
              {{getRowsName(currentPost.rostering, labelState.data?.enterprise_post_info_rostering, currentPost.rosteringAdd)}}
            </view>
          </view>
        </view>
      </uni-section>
    </view>
    <data-empty v-else text="还未添加信息, 请先查看其它页面"></data-empty>
    <view class="introduce">公司介绍</view>
    <view class="body">
      <rich-text :nodes="formatRichText(companyInfo.enterpriseDesc)"></rich-text>
    </view>

    <view class="company-ope">
      <button class="company-ope-item" @click="showContact = true">
        <uni-icons type="chat" size="24"></uni-icons>
        <view>咨询</view>
      </button>
      <button class="company-ope-item" @click="handleRoutePk">
        <uni-badge :text="pkList.length ? pkList.length : '' " absolute="rightTop" size="small">
          <image class="company-ope-img" src="../../static/icon_pk.png"></image>
        </uni-badge>
        <view>开始对比</view>
      </button>
      <button class="company-ope-item" open-type="share">
        <uni-icons type="flag" size="24"></uni-icons>
        <!-- #ifndef MP-KUAISHOU -->
        <view>挣推荐费</view>
        <!-- #endif -->
        <!-- #ifdef MP-KUAISHOU -->
        <view>推荐好友</view>
        <!-- #endif -->
      </button>
    </view>
  </view>
  <view v-if="!companyInfo && isLoaded" class="empty">
    <data-empty text="无企业信息"></data-empty>
  </view>
  <contact-with-agent v-if="showContact" @close="showContact = false"></contact-with-agent>
  <view v-if="videoplay">
    <video
      controls
      id="myvideo"
      :initial-time="currentTime"
      :src="companyInfo.videos"
      @timeupdate="timeupdate"
      @ended="onEnded"
      @fullscreenchange="screenChange"
    ></video>
  </view>
</template>

<style scoped lang="scss">
  .company-container {
    padding-bottom: 70px;
  }

  .company-ope {
    position: fixed;
    display: flex;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #fff;
    border-top: 1px solid #ccc;
    z-index: 10;
  }

  .btn {
    margin-right: 10px;
  }
  .btn::after {
    border: none;
  }

  .company-ope-item {
    flex: 1;
    padding: 0;
    margin: 0;
    height: 60px;
    line-height: 1;
    background-color: transparent;
    font-size: 28rpx;
    color: #303133;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .company-ope-item::after {
    border: none;
  }

  .company-ope-img {
    width: 26px;
    height: 26px;
    opacity: .7;
  }

  .empty {
    min-height: 100vh;
    background-color: #f5f5f5;
  }

  .swiper {
    width: 100%;
    height: 440rpx;
  }

  .swiper-item {
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
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

  .address {
    font-size: 14px;
    margin-top: 5px;
  }

  .color-red {
    color: #f26f59;
  }

  .header-title-next {
    font-size: 15px;
    color: #f26f59;
    margin-left: 10px;
  }

  .flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #f26f59;
    font-size: 16px;
    margin-top: 5px;
  }

  .introduce {
    padding: 5px 15px 10px 15px;
    border-bottom: 1px solid #ccc;
    font-size: 17px;
    font-weight: bold;
    color: #000;
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
    flex-wrap: wrap;
    gap: 10px;
  }

  .post-list-item {
    box-sizing: border-box;
    min-width: 90px;
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
    overflow: hidden;
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
    width: 5em;
  }
</style>
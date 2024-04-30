<script setup lang="ts">
  import { ref, computed, nextTick, watchEffect } from 'vue'
  import { onLoad, onShow, onPageScroll } from "@dcloudio/uni-app";
  import { getAddress } from '../../utils/address'
  import { getHomeWeek, getRowsName } from '../../utils/index';
  import dayjs from 'dayjs';
  import app from '../../utils/application';
  import { useListRequest, useRequest } from '../../utils/hooks';
  import { doReferrerInfo } from '../../services/api';
  // import {
  //   getUserCityByPoi
  // } from '../../services/api';

  const showLogin = ref(false)
  const loginRef = ref(null);
  const unreadCount = ref(0)

  let isMounted = false;

  const currentCity = ref<{
    name : string; province ?: string; city ?: string; area ?: string;
  }>({
    name: '全国',
  })
  const city = ref('');

  const searchValue = ref('');
  const industryType = ref('');

  onLoad((query) => {
	  // 地理位置
    const referrerId = query.scene ? decodeURIComponent(query.scene) : undefined;
    console.log('referrerId', referrerId)
    console.log('query', query)
    doReferrerInfo(query.referrerId || referrerId);
    // 首次加载获取用户信息，
    app.getUserInfo().then(res => {
      isMounted = true;
	    // 如果手机号不存在则显示登录入口按钮
      if (!res.phoneNumber) {
        showLogin.value = true;
        // #ifndef MP-KUAISHOU
        loginRef.value.open();
        // #endif
      }
      const page = getCurrentPages();
      console.log('currentPage', page)
      page[page.length - 1].onShareAppMessage = () => {
        console.log('onShareAppMessage', `/pages/index/index?referrerId=${res.customerId}`)
        return {
          title: '嘉位招聘 说到做到',
          path: `/pages/index/index?referrerId=${res.customerId}`
        }
      }
      //#ifdef MP-WEIXIN
      page[page.length - 1].onShareTimeline = () => {
        return {
          title: '嘉位招聘 说到做到',
          query: `referrerId=${res.customerId}`
        }
      }
      // #endif
      fetchNotice();

      // app.getLocation().then((res: any) => {
      //   getUserCityByPoi(`${res.longitude},${res.latitude}`).then((res:any) => {
      //     const {
      //       city,
      //       adcode
      //     } = res.addressComponent;
      //     console.log(res.addressComponen)
      //     const cityCode = adcode.slice(0, 4) + '00';
      //     console.log(cityCode)
      //     currentCity.value = {
      //       name: city,
      //       city: cityCode
      //     }
      //     handleSearch({
      //       abbreviationName: searchValue.value,
      //       city: cityCode
      //     })
      //   })
      // })
    }).catch((err) => {
      uni.showToast({
        title: err?.message,
        icon: 'none'
      })
    })
    uni.$on('newMsg', value => {
      unreadCount.value = value;
    })
  })

  onShow(() => {
    if (isMounted) {
		// 回显主页的时候，获取用户信息，手机号不存在则显示登录入口按钮
      app.getUserInfo().then(res => {
        if (!res.phoneNumber) {
          showLogin.value = true;
          // #ifndef MP-KUAISHOU
          loginRef.value.open();
          // #endif
        } else {
          showLogin.value = false;
          loginRef.value.close();
        }
      })
    }
  })

  const {
    state,
    loadMore,
    loadStart
  } = useListRequest<any>({
    url: '/goods/enterprise/list',
    method: 'get',
    defaultParams: {
      status: 'E',
    },
    rowKey: 'enterpriseId'
  })

  const {
    state: labelState
  } = useRequest({
    url: '/system/dict/data/listAll',
    method: 'get',
    formatted: (res: any) => {
      const data: Record < string, Array < {
        key: string;name: string;
      } >> = {}

      if (Array.isArray(res)) {
        res.forEach((item: any) => {
          const key = `${item.dictType}`
          if (!data[key]) {
            data[key] = [{
              key: item.dictValue,
              name: item.dictLabel
            }]
          } else {
            data[key].push({
              key: item.dictValue,
              name: item.dictLabel
            })
          }
          // data[key] = item.labelValue ? JSON.parse(item.labelValue) : []
        })
      }
      return data;
    }
  })

  const industryDict = computed(() => {
    return labelState.value.data?.enterprise_info_industry_type.map(item => {
      return {
        value: item.key,
        text: item.name
      }
    })
  })

  const noticeData = ref([]);

  const fetchNotice = () => {
    useRequest({
      url: '/mobile/queryNotice',
      params: {
        status: 'E',
      },
      formatted: (res: any) => {
        noticeData.value = res;
      }
    });
  }

  // const {state: noticeData } = useRequest({
  //   url: '/mobile/queryNotice',
  //   params: {
  //     status: 'E',
  //   }
  // });

  function navigateToRecruit(isToday) {
    app.navigateTo({
      // url: `/pages/search/search?v=${v}&city=${currentCity.value.join(',')}`
      url: `/pages/search/search?isToday=${isToday}`,
      needAuth: false
    })
  }

  function navigateToPosition() {
    app.navigateTo({
      url: '/pages/position/index',
      needAuth: false
    })
  }

  function handleRouteCompany(company : any) {
    app.navigateTo({
      url: `/pages/company/index?enterpriseId=${company.enterpriseId}&enterpriseName=${encodeURIComponent(company.abbreviationName)}`,
      needAuth: false
    })
  }
  
  function handleGetPhone(e) {
    app.handleGetPhoneNumber(e, (userInfo: UserInfo) => {
      if (userInfo.verify !== 'T') {
        // uni.navigateTo({
        //   url: '/pages/user/nameAuth'
        // })
      }
      console.log('userInfo', userInfo)
      showLogin.value = false;
      loginRef.value.close();
    })
  }

  const popup = ref()

  function handleCityClick() {
    if (!popup.value) return;
    popup.value.open('bottom');
  }

  function handleCityChange(e) {
    popup.value.close();
    currentCity.value = e;
    const newObj = {
      ...e
    }
    delete newObj.name;
    loadStart({
      abbreviationName: searchValue.value,
      industryType: industryType.value,
      ...newObj
    })
  }

  function handleCompanySearch() {
    const newObj = {
      ...currentCity.value
    }
    delete newObj.name;
    nextTick(() => {
      loadStart({
        abbreviationName: searchValue.value,
        industryType: industryType.value,
        ...newObj
      })
    })
  }

  function handleSearchReset() {
    searchValue.value = '';
    industryType.value = '';
    handleCompanySearch();
  }

  const handleContact = () => {
    app.getUserInfo().then(res => {
      uni.makePhoneCall({
        phoneNumber: res.agentPhone || '400 880 1090',
      })
    })
  }

  const provinces = ref([]);
  const getProvince = () => {
    useRequest({
      url: '/basic/province/queryEnterpriseProvince',
      method: 'get',
      params: {
        // recruitmentDate: dayjs().format('YYYY-MM-DD')
      },
      formatted: (res: any) => {
        provinces.value = res.map((item: any) => {
          return {
            text: item.provinceName,
            value: item.provinceCode
          }
        });
        provinces.value.unshift({
          text: '全国',
          value: ''
        });
      }
    });
  };

  const getCity = (provinceCode: string) => {
    if (!provinceCode) {
      return;
    }
    const index = provinces.value.findIndex(item => item.value === provinceCode);
    if (index > -1 && provinces.value[index].children && provinces.value[index].children.length > 0) {
      return;
    }
    useRequest({
      url: '/basic/city/queryEnterpriseCity',
      method: 'get',
      params: {
        // recruitmentDate: dayjs().format('YYYY-MM-DD'),
        provinceCode: provinceCode
      },
      formatted: (res: any) => {
        provinces.value[index].children = res.map((item: any) => {
          return {
            text: item.cityName,
            value: item.cityCode
          }
        });
      }
    });
  }

  // 获取区县
  const getArea = (cityCode: string, tabIndex) => {
    const option = getSelectedOptionsByValue(provinces.value, cityCode);
    const currentCity = option[tabIndex];
    if (option && option[tabIndex] && option[tabIndex].children && option[tabIndex].children.length > 0) {
      return;
    }
    useRequest({
      url: '/basic/area/queryEnterpriseArea',
      method: 'get',
      params: {
        // recruitmentDate: dayjs().format('YYYY-MM-DD'),
        cityCode: cityCode
      },
      formatted: (res: any) => {
        if (currentCity) {
          currentCity.children = res?.map((item: any) => {
            return {
              text: item.areaName,
              value: item.areaCode
            }
          });
        }
      }
    });
  }

  const getSelectedOptionsByValue = (options: Array<any>, value: string) => {
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      
      if (option.value === value) {
        return [option];
      }

      if (option.children) {
        const selectedOptions = getSelectedOptionsByValue(option.children, value);
        if (selectedOptions) {
          return [option, ...selectedOptions];
        }
      }
    }
  };

  getProvince();

  const onChange = (e) => {
    if (e.tabIndex === 0) {
      getCity(e.value);
    } else if (e.tabIndex === 1) {
      getArea(e.value, e.tabIndex);
    }
  };
  
  const {state: switchState } = useRequest({
    url: '/system/config/configKey/mini.review.switch',
    method: 'get'
  })
  
  const handleCityConfirm = (e) => {
    const { value, selectedOptions } = e;
    const selected = selectedOptions.filter(p => !!p);
    if (selected.length === 1) {
      currentCity.value.province = value;
      currentCity.value.city = '';
      currentCity.value.area = '';
    } else if (selected.length === 2) {
      currentCity.value.city = value;
      currentCity.value.area = '';
    } else if (selected.length === 3) {
      currentCity.value.area = value;
    } else {
      currentCity.value.province = '';
      currentCity.value.city = '';
      currentCity.value.area = '';
    }
    handleCompanySearch();
  }

  // 视频播放相关逻辑
  const videoContexts = ref([]);
  const videoRects = ref([]);
  const windowHeight = uni.getSystemInfoSync().windowHeight; // 屏幕高度
  watchEffect(() => {
    // 请不要删除这个watchEffect，否则会导致视频组件无法播放
    console.log(state.value.rows.length)
    // 获取所有视频组件的上下文对象和位置信息
    nextTick(() => {
      const queries = uni.createSelectorQuery();
      queries.selectAll('.video').boundingClientRect(rects => {
        rects.forEach((rect, index) => {
          // 如果videoContexts中不存在当前视频组件的上下文对象，则添加
          if (videoContexts.value.findIndex(p => p.id === rect.id) === -1) {
            videoContexts.value.push({
              id: rect.id,
              top: rect.top,
              bottom: rect.bottom,
              context: uni.createVideoContext(rect.id)
            });
          };
        });
        // 第一个视频组件默认播放
        if (videoContexts.value.length > 0) {
          videoContexts.value[0].context.play();
        }
      }).exec();
    })
  });

  onPageScroll((e) => {
    const scrollTop = e.scrollTop;
    // 遍历所有视频组件，判断是否在可视区域内并控制播放状态
    videoContexts.value.forEach((rect, index) => {
      const videoTop = rect.top - scrollTop;
      const videoBottom = rect.bottom - scrollTop;
      // 判断视频组件是否在可视区域内
      const inView = videoBottom < windowHeight && videoTop > 153;

      nextTick(() => {
        if (inView) {
          rect.context.play();
        } else {
          rect.context.pause();
        }
      });
    });
  })

  const handleClose = () => {
    loginRef.value.close();
  }

  const getMore = () => {
    uni.navigateTo({
      url: '/pages/notice/index'
    })
  }

  const showContact = ref(false);
  
	const onSwiperChange = (e:any, item)=> {
		const currentIndex = e.detail.current;
    // 如果是第一个视频组件，则播放视频，否则暂停视频
    if (item.videos && switchState?.data?.msg !== '0') {
      const videoContext = videoContexts.value.find(p => p.id === `video${item.enterpriseId}`)?.context;
      if (videoContext) {
        if (currentIndex === 0) {
          videoContext.play();
        } else {
          videoContext.pause();
        }
      }
    }
	}
  
</script>

<template>
  <view class="head">
    <swiper v-if="noticeData?.length > 0" class="notice-box" autoplay circular vertical>
      <swiper-item v-for="(item, index) in noticeData" :key="item.noticeId">
        <view class="notice-item" :class="'swiper-item' + index">
          <uni-notice-bar
            single
            show-get-more
            show-icon
            color="#2979FF"
            moreColor="#e43d33"
            background-color="#EAF2FF"
            :text="item.noticeTitle"
            moreText="查看更多"
            @getmore="getMore"
          ></uni-notice-bar>
        </view>
      </swiper-item>
    </swiper>
    <form conversion-target="1" clue-component-id="0e0d203fd9901c05e319d20aff1b31d1">
      <view class="search-bar-container">
        <view style="flex: 200rpx 0 0">
          <uni-cascader title="请选择城市" :options="provinces" v-model="city" @change="onChange" @confirm="handleCityConfirm"></uni-cascader>
        </view>
        <view style="flex: 1; margin-left: 12rpx;">
          <uni-data-select
            v-model="industryType"
            :localdata="industryDict"
            placeholder="行业"
            @change="handleCompanySearch"
            @clear="handleCompanySearch"
          ></uni-data-select>
        </view>
      </view>
      <view style="flex: 1">
        <uni-search-bar style="flex: 1;text-align: left;" @confirm="handleCompanySearch" v-model="searchValue"
          cancelButton="none" placeholder="企业名称" @clear="handleSearchReset">
        </uni-search-bar>
      </view>
    </form>
    <view class="search-nav-container">
      <view class="search-nav-block" @click="navigateToRecruit(1)">
        <view>今天面试</view>
        <view class="date">{{getHomeWeek(dayjs())}}</view>
      </view>
      <view class="search-nav-block" @click="navigateToRecruit(0)">
        <view>明天面试</view>
        <view>{{getHomeWeek(dayjs().add(1, 'd'))}}</view>
      </view>
      <view class="search-nav-block" @click="navigateToPosition(2)">
        <view class="empty">岗位列表</view>
        <view class="empty">岗位列表</view>
        <view class="fixed">岗位列表</view>
      </view>
    </view>
  </view>
  <!-- <swiper class="swiper" circular indicator-dots autoplay :interval="2000" :duration="500">
    <swiper-item>
      <image class="swiper-item" src="/static/home-banner.jpg" />
    </swiper-item>
  </swiper> -->
  <!-- <uni-notice-bar showIcon single scrollable text="[单行] 这是 NoticeBar 通告栏，这是 NoticeBar 通告栏，这是 NoticeBar 通告栏">
  </uni-notice-bar> -->

  <view class="recruit-list" @scrolltolower="loadMore">
    <!-- <view class="recruit-list-header" v-if="noticeData.data && noticeData.data.length > 0">通知</view>
    <view class="notice-item" v-for="item in noticeData.data" :key="item.noticeId">
      {{item.noticeContent}}
    </view> -->
    <view class="recruit-list-header" v-if="state.rows.length > 0">
      <view>企业信息</view>
      <!-- <view class="recruit-list-header-right">更多
        <uni-icons type="forward" color="rgba(64, 61, 61, 0.53)"></uni-icons>
      </view> -->
    </view>
    <view v-if="state.rows.length > 0" class="recruit-list-item" v-for="(item,index) in state.rows" :key="item.enterpriseId"
      @click="()=> handleRouteCompany(item)">
		<swiper class="swiper" type="scroll" v-if="item.pictures" @change="(e) => onSwiperChange(e, item)" circular :indicator-dots="true" :autoplay="!item.videos" :interval="2000"
	  				:duration="500">
      <swiper-item v-if="item.videos && switchState?.data?.msg !== '1'">
        <video :id="`video${item.enterpriseId}`" class="recruit-list-img video" :muted="true" :src="item.videos" @click.stop show-mute-btn></video>
      </swiper-item>
      <swiper-item v-for="ite in item.pictures.split(',')" :key="ite">
        <image class="recruit-list-img" :src="ite" />
      </swiper-item>
		</swiper>
					
      <!-- <image v-if="item.pictures" class="recruit-list-img" :src="item.pictures.split(',')[0]" /> -->
      <view>
        <view class="list-item-title">{{item.abbreviationName}}</view>
        <view class="list-item-label">
          <!-- <view class="tag">{{item.industryTypeName}}</view>
          <view class="tag">{{item.enterpriseTypeName}}</view>
          <view class="tag">{{item.enterpriseScaleName}}</view> -->
          {{ getRowsName(item.industryType, labelState.data?.enterprise_info_industry_type) }}&ensp;|
          {{ getRowsName(item.enterpriseType, labelState.data?.enterprise_info_enterprise_type) }}&ensp;|
          {{ getRowsName(item.enterpriseScale, labelState.data?.enterprise_info_enterprise_scale) }}
        </view>
        <view class="list-item-address">
          <uni-icons type="paperplane" color="#0455e2" size="14"></uni-icons>
          <text>{{getAddress([item.province, item.city, item.area])}}{{item.address}} </text>
        </view>
      </view>
    </view>
    <view v-if="state.loading" class="list-status">正在加载中。。。</view>
    <view v-else-if="!state.hasMore" class="list-status">没有更多了~</view>
  </view>
  <!-- <view v-if="showLogin" class="login-tip"> -->
  <view v-if="false" class="login-tip">
    <view>立即开始我的求职之旅</view>
  		<!-- #ifdef MP-KUAISHOU --> 
  			<button class="phone-btn" open-type="getPhoneNumber" bindgetphonenumber="handleGetPhone">手机号一键登录</button>
  		<!-- #endif -->
  		<!-- #ifdef MP-WEIXIN || MP-TOUTIAO --> 
        <button class="phone-btn" formType="submit" open-type="getPhoneNumber" @getphonenumber="handleGetPhone">手机号一键登录</button>
      <!-- #endif -->

  </view>
  <view class="contact" :class="{bottom: !showLogin}" @click="showContact=true">
    <uni-icons type="chat-filled" color="#2979ff" size="20"></uni-icons>
    <text>咨询</text>
    <view class="badge">
      <uni-badge :text="unreadCount"></uni-badge>
    </view>
  </view>
  <uni-popup ref="popup" background-color="#fff">
    <city-choose @ok="handleCityChange"></city-choose>
  </uni-popup>
  <uni-popup ref="loginRef" mask-background-color="rgba(0, 0, 0, 0.65)" :is-mask-click="false">
    <view class="popup-content">
      <view class="slogan">立即开始我的求职之旅</view>
      <!-- #ifdef MP-KUAISHOU --> 
        <button class="phone-btn" open-type="getPhoneNumber" bindgetphonenumber="handleGetPhone">手机号一键登录</button>
        <view class="next-time" @click="handleClose">下次再说</view>
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN --> 
        <button class="phone-btn" open-type="getPhoneNumber" @getphonenumber="handleGetPhone">手机号一键登录</button>
      <!-- #endif -->
      <!-- #ifdef MP-TOUTIAO --> 
      <form conversion-target="1" clue-component-id="c64b89e25095a7d0348f1ee13ff5b4b0">
        <button class="phone-btn" open-type="getPhoneNumber" @getphonenumber="handleGetPhone">手机号一键登录</button>
      </form>
      <!-- #endif -->
      <uni-icons class="close" type="close" size="30" color="#909399" @click="handleClose"></uni-icons>
    </view>
  </uni-popup>
  <contact-with-agent v-if="showContact" @close="showContact = false"></contact-with-agent>
</template>

<style scoped lang="scss">
.head {
  position: sticky;
  top: 0;
  padding-bottom: 16rpx;
  z-index: 10;
  background-color: #fff;
}
  .notice-box {
    height: 82rpx;
    .notice-item {
      height: 82rpx;
    }
  }
  .search-bar-container {
    margin: 10rpx 10px 0;
    display: flex;
    align-items: center;
  }

  .city-btn {
    padding: 0;
    margin: 0;
    background-color: transparent;
    color: #000;
    font-size: 14px;
    border-width: 0;
    margin-right: 5px;
  }

  // .search-bar {
  //   display: flex;
  //   box-sizing: border-box;
  //   overflow: hidden;
  //   position: relative;
  //   flex: 1;
  //   flex-direction: row;
  //   align-items: center;
  //   height: 36px;
  //   padding: 5px 8px 5px 10px;
  //   border-radius: 5px;
  //   background-color: #F8F8F8;
  // }

  // .search-bar-text {
  //   margin-left: 10px;
  //   font-size: 14px;
  //   color: #888;
  // }


  .current-city {
    min-width: 80px;
    height: 56px;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dropdown-img {
    width: 12px;
    height: 8px;
    margin-left: 4px;
  }

  .search-nav-container {
    margin: 5px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
  }

  .search-nav-block {
    flex: 1;
    position: relative;
    // background-color: #aaa;
    background-color: $uni-primary;
    padding: 10rpx 0;
    text-align: center;
    border-radius: 5px;
    color: #f2f2f2;
    font-size: 28rpx;
    .fixed {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      transform: translate(-50%, -50%);
    }
    .empty {
      visibility: hidden;
    }
  }

  .search-nav-block.selected {
    background-color: $uni-primary;
  }

  .swiper-item {
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
  }

  .recruit-list {
    padding: 0 24rpx;
    background-color: #f7f8f9;
    box-sizing: border-box;
  }

  .recruit-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10rpx 0;
    font-size: 30rpx;
    font-weight: 500;
  }

  .recruit-list-header-right {
    color: rgba(64, 61, 61, 0.53);
  }
  // .notice-item {
  //   padding: 10rpx;
  //   background-color: #fff;
  //   font-size: 28rpx;
  //   color: #303133;
  //   border-bottom: 1px solid #ebedf0;
  // }

  .recruit-list-item {
    // display: flex;
    padding: 24rpx;
    background-color: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
  }
  .swiper {
    width: 100%;
    height: 50vw;
    overflow: hidden;
  }
  .recruit-list-img {
    // margin-right: 24rpx;
    // flex: 160rpx 0 0;
    // height: 160rpx;
    // border-radius: 8rpx;
    width: 100%;
    height: 50vw;
  }

  .list-item-title {
    // font-size: 32rpx;
    // font-weight: 500;
    // color: #1A1A1A;
    font-size: 14px;
    margin-bottom: 5px;
  }

  .list-item-label {
    // margin-bottom: 16rpx;
    // font-size: 24rpx;
    // color: #101010;
    font-size: 12px;
    color: #101010;
    margin-bottom: 5px;
    .tag {
      display: inline-block;
      margin-top: 20rpx;
      margin-right: 10rpx;
      padding: 4rpx 16rpx;
      border-radius: 8rpx;
      color: #2979ff;
      background-color: rgb(41, 121, 255, 0.1);
      border: 1px solid #2979ff;
      &:last-child {
        margin-right: 0;
        margin-top: 10rpx;
      }
    }
  }

  .list-item-address {
    display: flex;
    align-items: center;
    font-size: 24rpx;
    color: rgba(64, 61, 61, 0.53);
  }

  .list-status {
    font-size: 12px;
    text-align: center;
    padding: 5px;

  }

  .login-tip {
    box-sizing: border-box;
    position: fixed;
    left: 0;
    bottom: var(--window-bottom);
    width: 100%;
    padding: 10rpx 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.65);
    font-size: 30rpx;
    color: #fff;
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
    .badge {
      position: absolute;
      right: 0rpx;
      top: 0rpx;
    }
  }
  .contact.bottom {
    bottom: calc(var(--window-bottom) + 250rpx);
  }

  .login-tip .phone-btn {
    background-color: $uni-primary;
    color: #fff;
    font-size: 32rpx;
    padding: 0 24rpx;
    margin: 0;
  }

  .next-time {
    margin-top: 20rpx;
    font-size: 32rpx;
    color: #ccc;
  }

  .company-empty {
    text-align: center;
    margin: 10px;
  }
  .popup-content {
    position: relative;
    font-size: 32rpx;
    color: #ffffff;
    font-weight: 500;
    text-align: center;
    background-color: transparent;
    .phone-btn {
      margin-top: 60rpx;
      padding: 6rpx 128rpx;
      width: 100%;
      background: linear-gradient(180deg, #60a3f6 0%, #2979ff 100%);
      color: #ffffff;
      border-radius: 72rpx;
      &::after {
        border: none;
      }
    }
    .close {
      position: absolute;
      top: -200rpx;
      right: -50rpx;
    }    
  }
</style>
<style>
.uni-searchbar__text-placeholder {
  flex: 1;
}
</style>
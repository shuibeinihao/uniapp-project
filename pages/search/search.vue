<script setup lang="ts">
  import {
    computed,
    onMounted,
    ref,
    nextTick,
    watch
  } from 'vue'
  import {
    onLoad,
    onShow
  } from "@dcloudio/uni-app";
  import app from '../../utils/application';
  import dayjs from 'dayjs'
  import { useRequest, useListRequest } from '@/utils/hooks'
  import {
    getRowsName,
    getHomeWeek,
    resetParams,
    formatRichText
  } from '@/utils/index'
  import {
    getAddress
  } from '@/utils/address'
  import { doReferrerInfo } from "@/services/api";

  const isToday = ref(1)
  const referrerId = ref<string>(''); // 推荐人ID

  onLoad(async (option) => {
    if (option.isToday) {
      isToday.value = +option.isToday;
    }
    await app.login();
    if (option.v) {
      searchValue.value = option.v;
    }
    if (option.workType) {
      query.value.workType = option.workType;
    }
    if (option.postLight) {
      query.value.postLight = option.postLight;
    }
    if (option.workCity) {
      query.value.workCity = option.workCity;
    }
    if (option.offerPrice) {
      query.value.offerPrice = option.offerPrice;
    }
    const refId = query.scene ? decodeURIComponent(query.scene) : undefined;

    referrerId.value = option.referrerId || refId;
    console.log('分享人id: ', referrerId.value)
    doReferrerInfo(referrerId.value);
    loadStart({
      recruitmentDate: isToday.value == 2 ? '' : dayjs().add(isToday.value ? 0 : 1, 'd').format('YYYY-MM-DD'),
      beginRecruitmentDate: isToday.value == 2 ? dayjs().add(2, 'd').format('YYYY-MM-DD') : null,
      endRecruitmentDate: isToday.value == 2 ? dayjs().add(7, 'd').format('YYYY-MM-DD') : null,
      ...query.value
    });
    getProvince();
  })

  const query = ref({
    offerPrice: '',
    workType: '',
    postLight: '',
    postType: '',
    workProvince: '',
    workCity: '',
    workArea: ''
  })

  const {state: switchState } = useRequest({
    url: '/system/config/configKey/mini.review.switch',
    method: 'get'
  })

  watch(() => query.value, (val) => {
    searchChange();
  }, {
    deep: true
  });

  const postList = ref([])

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
          if (item.status === '0') {
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
          }
        })
      }
      return data;
    }
  })

  const provinces = ref([]);

  const searchValue = ref('')
  const handleSearch = (value: string, today: number) => {
    isToday.value = today;
    loadStart({
      enterpriseName: value,
      recruitmentDate: isToday.value == 2 ? '' : dayjs().add(isToday.value ? 0 : 1, 'd').format('YYYY-MM-DD'),
      beginRecruitmentDate: isToday.value == 2 ? dayjs().add(2, 'd').format('YYYY-MM-DD') : null,
      endRecruitmentDate: isToday.value == 2 ? dayjs().add(7, 'd').format('YYYY-MM-DD') : null,
      ...query.value
    });
    getProvince();
  }

  const {
    state,
    loadMore,
    loadStart
  } = useListRequest<any>({
    url: '/goods/recruitment/list',
    method: 'get',
    manual: true,
    defaultParams: {
    },
    rowKey: 'recruitmentId'
  })

  const handleRoutePost = (postInfo) => {
    let url = `/pages/company/index?recruitmentId=${postInfo.recruitmentId}&tabValue=${isToday.value === 1 ? '1' : '2'}&enterpriseId=${postInfo.enterpriseId}&enterpriseName=${encodeURIComponent(postInfo.enterpriseName || '')}`;
    if (referrerId.value) {
      url += `&referrerId=${referrerId.value}`;
    }
    uni.navigateTo({ url });
  }

  const pkList = ref([])

  onShow(() => {
    pkList.value = app.globalData.get('pk_list') || [];
  })

  const applyModal = ref({
    show: false,
    post: null,
    workTypeName: '',
    referrerId: referrerId.value
  })
  const rowApply = (row) => {
    app.getUserInfo(false, true, true).then((res) => {
      const workTypeName = getRowsName(row.workType, labelState.value.data?.enterprise_post_info_work_type)
      if (!res || !res.customerName || !res.verify || res.verify !== 'T') {
        return;
      }
      applyModal.value = {
        show: true,
        post: row,
        workTypeName,
        referrerId: referrerId.value
      }
    }).catch(err => { })
  }

  const rowShare = (row) => {
    curRow.value = row;
  }

  const curRow = ref({});
  onLoad(() => {
    app.getUserInfo().then(res => {
      const page = getCurrentPages();
      page[page.length - 1].onShareAppMessage = () => {
        let recruitmentId = curRow.value.recruitmentId;
        let postId = recruitmentId ? '' : curRow.value.postId;
        const url = `workType=${query.value.workType}&postLight=${query.value.postLight}&workCity=${query.value.workCity}&v=${searchValue.value}&isToday=${isToday.value}&offerPrice=${query.value.offerPrice}&referrerId=${res.customerId}`;
        return {
          title: decodeURIComponent(curRow.value.enterpriseName || '嘉位招聘 说到做到'),
          // path: `/pages/search/search?enterpriseId=${row.enterpriseId}&enterpriseName=${row.enterpriseName}&tabValue=1&recruitmentId=${recruitmentId || ''}&postId=${postId || ''}&referrerId=${res.customerId}`
          path: `/pages/search/search?${url}`
        }
    
      }
      // #ifdef MP-WEIXIN
      page[page.length - 1].onShareTimeline = () => {
        let recruitmentId = curRow.value.recruitmentId;
        let postId = recruitmentId ? '' : curRow.value.postId;
        const url = `workType=${query.value.workType}&postLight=${query.value.postLight}&workCity=${query.value.workCity}&v=${searchValue.value}&isToday=${isToday.value}&offerPrice=${query.value.offerPrice}&referrerId=${res.customerId}`;
        return {
          title: decodeURIComponent(curRow.value.enterpriseName || '嘉位招聘 说到做到'),
          query: url
        }
      }
      // #endif
    }).catch(() => { })
  });

  const rowPk = (row) => {
    const index = pkList.value.findIndex(item => item.recruitmentId === row.recruitmentId)
    if (index > -1) {
      return;
    }
    pkList.value.push(row)
    app.globalData.set('pk_list', [...pkList.value])
  }

  const handleRoutePk = () => {
    if (pkList.value.length < 1) {
      uni.showToast({ title: '请添加要PK的岗位', icon: 'none' });
      return;
    }
    uni.navigateTo({
      url: '/pages/company/pk'
    })
  }

  const handlePhoneCall = () => {
    app.getUserInfo().then(res => {
      uni.makePhoneCall({
        phoneNumber: res.agentPhone || '400 880 1090',
      })
    })
  }

  // 判断当前岗位是否已经添加PK
  const hasExist = (row) => {
    const index = pkList.value.findIndex(item => item.recruitmentId === row.recruitmentId)
    return index > -1;
  }

  const postLightDict = computed(() => {
    return labelState.value.data?.enterprise_post_info_post_light.map(item => {
      return {
        value: item.key,
        text: item.name
      }
    })
  });

  const postTypeDict = computed(() => {
    return labelState.value.data?.enterprise_post_info_post_type.map(item => {
      return {
        value: item.key,
        text: item.name
      }
    })
  });

  const workTypeDict = computed(() => {
    return labelState.value.data?.enterprise_post_info_work_type.map(item => {
      return {
        value: item.key,
        text: item.name
      }
    })
  });

  const offerPriceDict = computed(() => {
    return labelState.value.data?.enterprise_post_info_offer_price.map(item => {
      return {
        value: item.key,
        text: item.name
      }
    })
  });
  
  const searchChange = () => {
    nextTick(() => {
      handleSearch(searchValue.value, isToday.value)
    });
  }

  const getProvince = () => {
    let recruitment = dayjs().add(isToday.value ? 0 : 1, 'd').format('YYYY-MM-DD');
    // 明天以后最近一个日期添加到PC招聘目录
    if (isToday.value === 2) {
      recruitment = dayjs().add(2, 'd').format('YYYY-MM-DD');
    }
    useRequest({
      url: '/basic/province/queryRecruitmentProvince',
      method: 'get',
      params: {
        recruitmentDate: recruitment
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
    let recruitment = dayjs().add(isToday.value ? 0 : 1, 'd').format('YYYY-MM-DD');
    // 明天以后最近一个日期添加到PC招聘目录
    if (isToday === 2) {
      recruitment = dayjs().add(2, 'd').format('YYYY-MM-DD');
    }
    const index = provinces.value.findIndex(item => item.value === provinceCode);
    if (index > -1 && provinces.value[index].children && provinces.value[index].children.length > 0) {
      return;
    }
    useRequest({
      url: '/basic/city/queryRecruitmentCity',
      method: 'get',
      params: {
        recruitmentDate: recruitment,
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
    let recruitment = dayjs().add(isToday.value ? 0 : 1, 'd').format('YYYY-MM-DD');
    // 明天以后最近一个日期添加到PC招聘目录
    if (isToday === 2) {
      recruitment = dayjs().add(2, 'd').format('YYYY-MM-DD');
    }
    const option = getSelectedOptionsByValue(provinces.value, cityCode);
    const currentCity = option[tabIndex];
    if (option && option[tabIndex] && option[tabIndex].children && option[tabIndex].children.length > 0) {
      return;
    }
    useRequest({
      url: '/basic/area/queryRecruitmentArea',
      method: 'get',
      params: {
        recruitmentDate: recruitment,
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

  const workCity = ref('');

  const cityChange = (val) => {
    const selectedOptions = val.selectedOptions.filter(item => !!item);
    console.log('val', val, selectedOptions)
    if (selectedOptions.length === 0) {
      query.value.workProvince = '';
      query.value.workCity = '';
      query.value.workArea = '';
    } else if (selectedOptions.length === 1) {
      query.value.workProvince = val.value;
      query.value.workCity = '';
      query.value.workArea = '';
    } else if (selectedOptions.length === 2) {
      query.value.workCity = val.value;
      query.value.workArea = '';
    } else if (selectedOptions.length === 3) {
      query.value.workArea = val.value;
    }
    // searchChange();
  };

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
  const showContact = ref(false);
</script>

<template>
  <view class="page">
    <view class="header">
      <view class="search-bar-container" style="display: flex;align-items: center;padding-left: 20rpx;">
        <!-- <picker mode='multiSelector' :value="currentCity" :range="cityRanges" @change="handleCityChange"
          @columnchange="handleColumnChange">
          <view class="current-city">
            <text>{{showCurrentCity}}</text>
            <image class="dropdown-img" src='/static/dropdown.png'></image>
          </view>
        </picker> -->
        <view style="flex: 200rpx 0 0">
          <uni-cascader title="请选择城市" :options="provinces" v-model="workCity" @change="onChange" @confirm="cityChange"></uni-cascader>
        </view>
        <view style="flex: 140rpx 0 0;margin-left: 8rpx">
          <uni-data-select
            v-model="query.postType"
            :localdata="postTypeDict"
            placeholder="类型"
          ></uni-data-select>
        </view>
        <view style="flex: 1">
          <uni-search-bar :focus="true" v-model="searchValue" cancelButton="none" @confirm="handleSearch(searchValue, isToday)" @clear="handleSearch('', isToday)">
          </uni-search-bar>
        </view>
      </view>
      <view class="search-nav-container">
        <view :class="['search-nav-block', {selected: isToday === 1}]" @click="handleSearch(searchValue, 1)">
          <view>今天面试</view>
          <view>{{getHomeWeek(dayjs())}}</view>
        </view>
        <view :class="['search-nav-block', {selected: isToday === 0}]" @click="handleSearch(searchValue, 0)">
          <view>明天面试</view>
          <view>{{getHomeWeek(dayjs().add(1, 'd'))}}</view>
        </view>
        <view :class="['search-nav-block', {selected: isToday === 2}]" @click="handleSearch(searchValue, 2)">
          <view class="empty">招聘预告</view>
          <view class="empty">招聘预告</view>
          <view class="fixed">招聘预告</view>
        </view>
      </view>
      <view class="search-nav-container" style="display: flex;">
        <view class="search-nav-item">
          <uni-data-select
            v-model="query.postLight"
            :localdata="postLightDict"
            placeholder="岗位亮点"
          ></uni-data-select>
        </view>
        <view class="search-nav-item">
          <uni-data-select
            v-model="query.workType"
            :localdata="workTypeDict"
            placeholder="工种"
          ></uni-data-select>
        </view>
        <view class="search-nav-item">
          <uni-data-select
            v-model="query.offerPrice"
            :localdata="offerPriceDict"
            placeholder="报价"
          ></uni-data-select>
        </view>
      </view>
    </view>
    <view v-if="state.rows?.length>0" class="list">
      <view v-for="item in state.rows" :key="item.recruitmentId" class="list-item" @click="()=> handleRoutePost(item)">
        <view class="list-item-content-line" v-if="isToday === 2">面试日期：{{ item.recruitmentDate }}</view>
        <view class="list-item-header">
          <view>
            <text class="list-item-title">{{item.enterpriseName}}</text>
            <text v-if="item.recruitmentState==='P'">招聘中</text>
            <text v-else-if="item.recruitmentState==='W'" class="red">待定</text>
            <text v-else-if="item.recruitmentState==='R'" class="red">暂停</text>
            <text v-else-if="item.recruitmentState==='A'" class="red">待审</text>
          </view>
          <view>
            <!-- <view class="list-item-btn">立即报名</view> -->
          </view>
        </view>
        <view class="list-item-gaps">
          <text class="list-item-gap"
            v-if="item.postType">{{getRowsName(item.postType, labelState.data?.enterprise_post_info_post_type)}}</text>
          <text class="list-item-gap"
            v-if="item.workType">{{switchState?.data?.msg === '1' ? '包装工' : getRowsName(item.workType, labelState.data?.enterprise_post_info_work_type)}}</text>
          <text v-if="item.offerPrice"
            class="list-item-gap-last">{{getRowsName(item.offerPrice, labelState.data?.enterprise_post_info_offer_price)}}</text>
          <view class="btns">
            <view class="list-item-btn" :class="{disabled: hasExist(item)}" @click.stop="rowPk(item)">PK</view>
            <button class="list-item-btn" @click.stop="rowApply(item)">报名</button>
            <!-- #ifndef MP-KUAISHOU -->
            <button class="list-item-btn" open-type="share" @click.stop="rowShare(item)">挣推荐费</button>
            <!-- #endif -->
            <!-- #ifdef MP-KUAISHOU -->
            <button class="list-item-btn" open-type="share" @click.stop="rowShare(item)">分享</button>
            <!-- #endif -->
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
          <!-- #ifndef MP-KUAISHOU -->
          <view class="list-item-content-line">推荐费：{{item.recommendFee}}</view>
          <!-- #endif -->
          <view class="list-item-address-wrap">
            <image class="list-item-position-img" src="/static/position-fill.png"></image>
            <text
              class="list-item-address">{{getAddress([item.workProvince, item.workCity, item.workArea])}}{{item.workAddress}}</text>
          </view>
        </view>
      </view>
    </view>
    <data-empty v-else text="还未添加信息，请先查看其它页面"></data-empty>
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
    </view>
    <position-apply-modal v-if="applyModal.show" :post="applyModal.post" :workTypeName="applyModal.workTypeName"
      :gatherPointData="labelState.data?.enterprise_post_info_gather_point" :referrerId="applyModal.referrerId"
      @close="applyModal.show = false"></position-apply-modal>
    <contact-with-agent v-if="showContact" @close="showContact = false"></contact-with-agent>
  </view>
</template>


<style scoped lang="scss">
  .page {
    min-height: 100vh;
    background-color: #f5f5f5;
    .header {
      position: sticky;
      top: 0;
      z-index: 15;
      background-color: #f5f5f5;
    }
  }

  .search-bar-container {
    // display: flex;
    background-color: #fff;
  }

  .uni-searchbar {
    flex: 1;
    padding: 0;
    margin: 10px;
    border: 1px solid #c2c2c2;
    border-radius: 6px;
  }

  .search-nav-container {
    margin: 5px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20rpx;
    .search-nav-item {
      flex: 1;
    }
  }

  .search-nav-block {
    flex: 1;
    position: relative;
    background-color: #aaa;
    padding: 10rpx 0;
    text-align: center;
    border-radius: 10rpx;
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
      opacity: 0;
    }
  }

  .search-nav-block.selected {
    background-color: $uni-primary;
  }

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

  .red {
    color: #fe1e3f;
  }
  
  .status-w {
    color: #333;
  }
  
  .status-r {
    color: #bbb;
  }

  .list {
    position: relative;
    padding: 0 24rpx 136rpx;
    background-color: #f7f8f9;
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
    justify-content: space-between;
    margin-bottom: 5px;
  }

  .list-item-companyname {
    font-weight: bold;
    font-size: 16px;
    line-height: 2;
  }

  .list-item-btn {
    border: 1px solid $uni-primary;
    color: $uni-primary;
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

  .list-item-labels {
    // margin: 8px 0;
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
  .company-ope {
    position: fixed;
    display: flex;
    left: 0;
    bottom: 0;
    width: 100%;
    background-color: #fff;
    border-top: 1px solid #ccc;
    z-index: 10;
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
      .company-ope-img {
        width: 26px;
        height: 26px;
        opacity: .7;
      }
      &::after {
        border: none;
      }
    }
  }
</style>

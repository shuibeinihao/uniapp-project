<template>
  <view class="container">
    <!-- <view class="head">
      <view class="user-name">
        <text class="identity" :class="'identity-' + formData.identity">{{ formData.identityName }}</text>
        <text class="name">{{ formData.customerName || '?' }}</text>
        <text class="phone" @click="callPhone">{{ formData.phoneNumber }}</text>
      </view>
    </view> -->
    <view class="content">
      <uni-list :border="true">
        <uni-list-item title="来源" :rightText="getRowsName(formData.sourceType, labelState?.data?.customer_info_source_type)"></uni-list-item>
        <uni-list-item title="推广人" :rightText="formData.referrerName ? `${formData.referrerName}${formData.referrerIdCard ? formData.referrerIdCard.slice(-4) : ''}` : '公司'"></uni-list-item>
        <uni-list-item title="推广人身份" :rightText="getRowsName(formData.referrerIdentity, labelState?.data?.customer_info_identity) || '公司'"></uni-list-item>
        <uni-list-item title="注册时间" :rightText="formData.createTime ? dayjs(v).format('YYYY-MM-DD HH:mm') : ''"></uni-list-item>
        <uni-list-item title="身份" :rightText="getRowsName(formData.identity, labelState?.data?.customer_info_identity)"></uni-list-item>
        <uni-list-item title="未联" :rightText="formData.contactTime ? dayjs().diff(dayjs(formData.contactTime), 'days') + '天' : '暂无'"></uni-list-item>
        <uni-list-item title="沟通日期" border :rightText="formData.contactTime ? dayjs(formData.contactTime).format('YYYY-MM-DD') : ''"></uni-list-item>
        <!-- <uni-list-item title="昵称" :rightText="formData.nickName"></uni-list-item>
        <uni-list-item title="分类" :rightText="formData.typeName || '?'"></uni-list-item>
        <uni-list-item title="纹身情况" :rightText="formData.tattooName || '?'"></uni-list-item>
        <uni-list-item title="学历" :rightText="formData.educationName || '?'"></uni-list-item>
        <uni-list-item title="就业方向" :rightText="formData.titleName || '?'"></uni-list-item>
        <uni-list-item title="拨号情况" :rightText="formData.dialStateName || '?'"></uni-list-item>
        <uni-list-item title="备注" :note="formData.remark"></uni-list-item> -->
        <view class="form">
          <uni-forms ref="formRef" :modelValue="formData" :label-width="80">
            <uni-forms-item label="昵称" name="nickName">
              <uni-easyinput v-model="formData.nickName" placeholder="请输入昵称" />
            </uni-forms-item>
            <uni-forms-item label="就业方向" name="title">
              <uni-data-select v-model="formData.title" :localdata="labelState?.data?.customer_info_title"
                placeholder="请选择就业方向"></uni-data-select>
            </uni-forms-item>
            <uni-forms-item label="分类" name="type">
              <uni-data-select v-model="formData.type" :localdata="labelState?.data?.customer_info_type"
                placeholder="请选择分类"></uni-data-select>
            </uni-forms-item>
            <uni-forms-item label="纹身" name="tattoo">
              <uni-data-select v-model="formData.tattoo" :localdata="labelState?.data?.customer_info_tattoo" placeholder="请选择纹身">
              </uni-data-select>
            </uni-forms-item>
            <uni-forms-item label="学历" name="education">
              <uni-data-select v-model="formData.education" :localdata="labelState?.data?.customer_info_education"
                placeholder="请选择学历"></uni-data-select>
            </uni-forms-item>
            <uni-forms-item label="拨号情况" name="dialState">
              <uni-data-select v-model="formData.dialState" :localdata="labelState?.data?.customer_info_dial_state"
                placeholder="请选择拨号情况"></uni-data-select>
            </uni-forms-item>
            <uni-forms-item label="备注" name="remark">
              <uni-easyinput type="textarea" v-model="formData.remark" :maxlength="200" placeholder="请输入沟通情况备注1-200字" />
            </uni-forms-item>
          </uni-forms>
        </view>
        <uni-list-item title="手机号" :rightText="formData.phoneNumber"></uni-list-item>
        <uni-list-item title="姓名" :rightText="formData.customerName || '?'"></uni-list-item>
        <uni-list-item title="性别" :rightText="getRowsName(formData.sex, sexArr)"></uni-list-item>
        <uni-list-item title="年龄" :rightText="getUserAge(formData.idCard)"></uni-list-item>
        <uni-list-item title="户籍" :rightText="formData.address"></uni-list-item>
        <uni-list-item title="民族" :rightText="formData.nationName || '?'"></uni-list-item>
        <uni-list-item title="身份证号" :rightText="formData.idCard"></uni-list-item>
        <uni-list-item title="经纪人" :rightText="formData.agentName || formData.agentId || '?'"></uni-list-item>
      </uni-list>
    </view>
    <user-info-edit
      v-if="action.showType=== 'userInfoEdit'"
      :labelState="labelState.data"
      :data="action.data"
      @ok="handleUserInfoOk"
      @close="onClose"
    ></user-info-edit>
  </view>

  <cover-view class="footer">
    <button class="btn primary" @click="callPhone">拨打电话</button>
    <button class="btn primary plain" @click="handleSubmit">保存</button>
  </cover-view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from "@dcloudio/uni-app";
import dayjs from 'dayjs';
import { sexArr } from '@/constants';
import { resetParams, getRowsName, getUserAge } from '@/utils';
import request from '../../utils/request';
import { useRequest } from '@/utils/hooks';

const formData = ref({});
const customerId = ref('');

const action = ref<{
  showType ? : string;data ? : any;
}> ({});

const { state: labelState } = useRequest({
  url: '/system/dict/data/listAll',
  method: 'get',
  formatted: (res : any) => {
    const data : Record<string, Array<{
      value : string; text : string; key: string; name: string;
    }>> = {}
    if (Array.isArray(res)) {
      res.forEach((item : any) => {
        const key = `${item.dictType}`
        if (!data[key]) {
          data[key] = [{ key: item.dictValue, value: item.dictValue, text: item.dictLabel, name: item.dictLabel }]
        } else {
          data[key].push({ key: item.dictValue, value: item.dictValue, text: item.dictLabel, name: item.dictLabel })
        }
      })
    }
    return data;
  }
});

onLoad((options: any) => {
  customerId.value = options.customerId;
  getCustomerInfo();
});

const getCustomerInfo = () => {
  request({
    url: `/member/customer/${customerId.value}`,
    method: 'get'
  }).then((res: any) => {
    if (res.data) {
      formData.value = res.data;
    }
  })
}

const handleEdit = () => {
  action.value = {
    showType: 'userInfoEdit',
    data: formData.value
  }
}

const handleUserInfoOk = (data: any) => {
  action.value = {}
  getCustomerInfo();
}
const onClose = () => {
  action.value = {};
}

const callPhone = () => {
  if (!formData.value.phoneNumber) {
    uni.showToast({
      title: '该用户没有手机号',
      icon: 'none'
    })
    return;
  }
  uni.makePhoneCall({
    phoneNumber: formData.value.phoneNumber
  })
}

const formRef = ref();

const handleSubmit = () => {
  if (!formData.value.customerId) return;
  formRef.value.validate().then(async (values) => {
    try {
      request({
        url: '/member/customer/modify',
        data: resetParams(formData.value)
      }).then(() => {
        uni.showToast({ title: '保存成功' })
        uni.$emit('user:reload');
      })
    } catch (e) {
      //TODO handle the exception
    }
  }).catch(err => console.log('err'))
}

</script>
<style>
page {
  background-color: #f7f8fa;
}
</style>
<style lang="scss" scoped>
.container {
  position: relative;
  padding-bottom: 140rpx;
  .head {
    position: relative;
    padding: 24rpx;
    font-size: 28rpx;
    color: #303133;
    background-color: #fff;
    box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.05);
    .user-name {
      display: flex;
      align-items: center;
      .identity {
        margin-right: 12rpx;
        padding: 0 6rpx;
        font-size: 24rpx;
        color: #fff;
        border-radius: 4rpx;
        background-color: #4598F3;
        &.identity-2 {
          background-color: #F3A459;
        }
        &.identity-3 {
          background-color: #F34545;
        }
      }
      .name {
        color: #333;
        font-weight: 500;
      }
      .phone {
        margin-left: 12rpx;
        color: #666;
      }
    }
  }
  .form {
    padding: 10px 15px 0;
    border-top: 1px solid #e5e5e5;
  }
}
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx 0 rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  z-index: 9;
  .btn {
    display: inline-block;
    margin-right: 24rpx;
    border-radius: 64rpx;
    font-size: 28rpx;
    box-sizing: border-box;
    border: 1rpx solid #2979ff;
    background-color: #fff;
    &.primary {
      color: #fff;
      background-color: #2979ff;
      &.plain {
        margin-right: 0;
        color: #2979ff;
        background-color: #fff;
      }
    }
    &::after {
      border: none !important;
    }
  }
}
</style>

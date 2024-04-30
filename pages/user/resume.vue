<script setup lang="ts">
  import {
    ref,
    reactive,
    onUnmounted,
    computed,
  } from 'vue';

  import {
    onLoad,
  } from "@dcloudio/uni-app";
  import app from '../../utils/application';
  import request from '../../utils/request';
  import { uploadFile } from "../../utils/request";
  import {
    log,
    getUserAge,
    getRowsName,
  } from '../../utils/index';
  import dayjs from 'dayjs'

  const formRef = ref(null)
  const formModel = ref < any > ({})
  const userInfo = ref < any > ({})
  const experience = ref < any[] > ([])
  const avatarFile = ref()

  const isEdit = ref(false)
  const labelState = ref < any > ()

  const action = ref < {
    showType ? : string;data ? : any;
  } > ({})

  onLoad(() => {
    app.getUserInfo(true, true).then(data => {
      console.log(data)
      if (data.resumeCreateTime) {
        isEdit.value = true;
      }
      userInfo.value = data;
      formModel.value = {
        openId: data.openId,
        emergencyName: data.emergencyName,
        emergencyPhone: data.emergencyPhone,
        emergencyAddress: data.emergencyAddress,
        resumeCreateTime: data.resumeCreateTime,
        resumeUpdateTime: data.resumeUpdateTime,
        bankName: data.bankName,
        bankBranch: data.bankBranch,
        bankCard: data.bankCard,
        ...data,
        avatarObj: data.avatar ? {
          name: 'image',
          extname: data.avatar.slice(-3),
          url: data.avatar,
        } : undefined
      }
      experience.value = data.jobExperience ? JSON.parse(data.jobExperience) : [{
        id: String(Date.now())
      }]
    })
    request({
      url: '/system/dict/data/listAll',
      method: 'get',
      // data: {
      //   tableName: 'customer_info',
      // }
    }).then(res => {
      const data: Record < string, Array < {
        key: string;name: string;
      } >> = {}

      if (Array.isArray(res.data)) {
        res.data.forEach((item: any) => {
          const key = `${item.dictType}`
          if (!data[key]) {
            data[key] = [{ value: item.dictValue, text: item.dictLabel }]
          } else {
            data[key].push({ value: item.dictValue, text: item.dictLabel})
          }
        })
      }
      labelState.value = data
    })
  })

  const rules = reactive({
    tattoo: {
      rules: [{
        required: false,
        errorMessage: '请选择纹身'
      }]
    },
    emergencyName: {
      rules: [{
        required: false,
        errorMessage: '请输入紧急联系人姓名'
      }]
    },
    emergencyPhone: {
      rules: [{
        required: false,
        errorMessage: '请输入紧急联系人电话'
      }]
    },
    emergencyAddress: {
      rules: [{
        required: false,
        errorMessage: '请输入紧急联系人常住地址'
      }]
    },
    bankName: {
      rules: [{
        required: false,
        errorMessage: '请输入银行名称'
      }]
    },
    bankBranch: {
      rules: [{
        required: false,
        errorMessage: '请输入开户支行'
      }]
    },
    bankCard: {
      rules: [{
        required: false,
        errorMessage: '请输入银行卡号'
      }]
    },
    phoneNumber: {
      rules: [{
        required: true,
        pattern: /^1[3456789]\d{9}$/,
        errorMessage: '请输入电话'
      }]
    },
  })

  const submitting = ref(false)

  const submitForm = () => {
    formRef.value.validate().then(async (values) => {
      // if (!validate()) return;
      if (submitting.value) return;
      submitting.value = true;
      try {
        const files = avatarFile.value.filesList
        if (files && files[0] && files[0].image) {
          const uploadRes = await uploadFile({ filePath: files[0].url });
          formModel.value.avatar = uploadRes.url;
        }
        const user = userInfo.value;
        const params = {
          ...formModel.value,
          // openId: user.openId,
          // customerName: user.customerName,
          // title: user.title,
          // idCard: user.idCard,
          // education: user.education,
          // email: user.email,
          // avatar: user.avatar,
          // phoneNumber: user.phoneNumber,
          // birthday: user.birthday,
          // tattoo: user.tattoo,
          // verify: user.verify,
          jobExperience: experience.value ? JSON.stringify(experience.value) : '',
          // cardValidDate: user.cardValidDate,
          // cardOrg: user.cardOrg,
        }
        // if (user.verify === 'T') {
        //   // 已实名认证 变更为3会员
        //   params.identity = '3'
        // }
        if (!params.resumeCreateTime) {
          params.resumeCreateTime = Date.now()
        } else {
          params.resumeUpdateTime = Date.now()
        }
        await request({
          url: '/mobile/updateCustomerInfoByOpenId',
          data: params
        })
        submitting.value = false;
        uni.showToast({
          title: '操作成功',
          duration: 1500,
          complete: () => {
            app.getUserInfo(true)
            uni.navigateBack({
              delta: 1
            })
          }
        })
      } catch (e) {
        uni.showToast({
          title: e.message || '保存失败',
          icon: 'error'
        })
      }
    }).catch(err => console.log('err'))
  }

  // 校验工作经验
  const validate = (): boolean => {
    for(let i = 0; i < experience.value.length; i++) {
      const item = experience.value[i];
      if (!item.company) {
        uni.showToast({ title: `请填写第${i+1}个工作经验的单位名称`, icon: 'none' });
        return false;
      }
      if (!item.position) {
        uni.showToast({ title: `请填写第${i+1}个工作经验的岗位`, icon: 'none' });
        return false;
      }
      if (!item.beginDate) {
        uni.showToast({ title: `请填写第${i+1}个工作经验的开始时间`, icon: 'none' });
        return false;
      }
      if (!item.endDate) {
        uni.showToast({ title: `请填写第${i+1}个工作经验的结束时间`, icon: 'none' });
        return false;
      }
    }
    return true;
  }

  const handleExperienceOk = data => {
    experience.value = data;
    action.value = {};
  }
  const handleUserInfoOk = data => {
    userInfo.value = data;
    action.value = {}
  }

  const addExperience = () => {
    experience.value.push({
      id: String(Date.now())
    });
  }

  const handleDel = (id: string) => {
    experience.value = experience.value.filter(itemId => itemId !== id)
  }

  const bindStartChange = (e, index) => {
    experience.value[index].beginDate = e.detail.value;
  };

  const bindEndChange = (e, index) => {
    experience.value[index].endDate = e.detail.value;
  };

  const bindcardValidDateBeginChange = (e) => {
    formModel.value.cardValidBegin = e.detail.value;
  };

  const bindcardValidDateEndChange = (e) => {
    formModel.value.cardValidDate = e.detail.value;
  };

  const endDate = computed(() => {
    const date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    return `${year}-${month}-${day}`;
  });
  
  function handleGetPhone(e) {
    app.handleGetPhoneNumber(e, (userInfo: any) => {
	  formModel.value.phoneNumber = userInfo.phoneNumber
    })
  }
  
</script>

<template>
  <!-- <experience-edit v-if="action.showType === 'experienceEdit'" :data="action.data" @ok="handleExperienceOk">
  </experience-edit> -->
  <user-info-edit v-if="action.showType=== 'userInfoEdit'" :labelState="labelState" :data="action.data"
    @ok="handleUserInfoOk"></user-info-edit>
  <view v-show="!action.showType" class="container">
    <template v-if="isEdit">
      <uni-forms ref="formRef" :modelValue="formModel" :rules="rules" :label-width="90">
        <uni-section title="个人信息" type="line">
          <!-- <view class="card user-info-card" @click="action={showType: 'userInfoEdit', data: userInfo}">
            <view class="user-name">
              <text>{{userInfo.customerName}}</text>
              &nbsp;
              <uni-icons type="compose" color="#888"></uni-icons>
            </view>
            <view class="user-sub">
              <text>{{getUserAge(userInfo.idCard)}}岁</text>
              <text v-if="userInfo.education">&nbsp;·&nbsp;{{userInfo.educationName}}</text>
            </view>
            <view v-if="userInfo.birthday" class="user-birth">{{dayjs(userInfo.birthday).format('YYYY年MM月DD日')}}</view>
            <view>电话：{{userInfo.phoneNumber}}</view>
            <view>邮箱：{{userInfo.email}}</view>
            <view>纹身：{{userInfo.tattooName}}</view>

            <view class="user-avatar-container">
              <image class="user-avatar" v-if="userInfo.avatar" :src="userInfo.avatar"></image>
              <view v-else-if="!userInfo.avatar" class="user-avatar">
                <uni-icons type="person-filled" size="50" color="#bbb"></uni-icons>
              </view>
              <view v-if="userInfo.title" class="user-title">
                {{userInfo.titleName}}
              </view>
            </view>
          </view> -->
          <view class="card">
            <uni-forms-item label="头像">
              <uni-file-picker ref="avatarFile" return-type="object" :auto-upload="false" fileMediatype="image"
                v-model="formModel.avatarObj" sizeType="['compressed']" fileExtname="png,jpg"
                :imageStyles="{width: 100, height: 140}">
              </uni-file-picker>
            </uni-forms-item>
            <uni-forms-item label="姓名">
              <view class="form-value">{{formModel.customerName}}</view>
            </uni-forms-item>
            <uni-forms-item label="电话" name="phoneNumber">
              <view class="flex-info">
                <!-- #ifdef MP-KUAISHOU -->
                  <uni-easyinput v-model="formModel.phoneNumber" placeholder="请输入电话" style="width: 100%;" />
                <!-- <button class="right-btn" open-type="getPhoneNumber" bindgetphonenumber="handleGetPhone">更换手机号</button> -->
                <!-- #endif -->
                <!-- #ifdef MP-WEIXIN || MP-TOUTIAO --> 
                <view class="form-value">{{formModel.phoneNumber}}</view>
                <button class="right-btn" formType="submit" open-type="getPhoneNumber" @getphonenumber="handleGetPhone">更换手机号</button>
                <!-- #endif -->
              </view>
            </uni-forms-item>
            <uni-forms-item label="邮箱" name="email">
              <uni-easyinput v-model="formModel.email" placeholder="请输入邮箱" />
            </uni-forms-item>
            <uni-forms-item label="身份证号">
              <view class="form-value" v-if="formModel.idCard">{{formModel.idCard}}</view>
            </uni-forms-item>
            <uni-forms-item label="出生日期">
              <view class="form-value" v-if="formModel.birthday">{{dayjs(formModel.birthday).format('YYYY年MM月DD日')}}</view>
            </uni-forms-item>
            <uni-forms-item label="身份证签发机关" name="cardOrg">
              <uni-easyinput v-model="formModel.cardOrg" placeholder="请输入身份证签发机关" />
            </uni-forms-item>
            <uni-forms-item label="身份证有效期(开始)" name="cardValidBegin">
              <!-- <uni-datetime-picker type="date" return-type="date" v-model="formModel.cardValidDate" /> -->
              <picker mode="date" :end="endDate" :value="formModel.cardValidBegin" @change="bindcardValidDateBeginChange">
                <view v-if="formModel.cardValidBegin" class="uni-input">{{formModel.cardValidBegin}}</view>
                <view v-else class="uni-input uni-input--placehoder">选择日期</view>
              </picker>
            </uni-forms-item>
            <uni-forms-item label="身份证有效期(到期)" name="cardValidDate">
              <!-- <uni-datetime-picker type="date" return-type="date" v-model="formModel.cardValidDate" /> -->
              <picker mode="date" :value="formModel.cardValidDate" @change="bindcardValidDateEndChange">
                <view v-if="formModel.cardValidDate" class="uni-input">{{formModel.cardValidDate}}</view>
                <view v-else class="uni-input uni-input--placehoder">选择日期</view>
              </picker>
            </uni-forms-item>
            <uni-forms-item label="学历" name="education">
              <uni-data-select v-model="formModel.education" :localdata="labelState?.customer_info_education"
                placeholder="请选择学历"></uni-data-select>
            </uni-forms-item>
            <uni-forms-item label="就业方向" name="title">
              <uni-data-select v-model="formModel.title" :localdata="labelState?.customer_info_title"
                placeholder="请选择就业方向"></uni-data-select>
            </uni-forms-item>
            <uni-forms-item label="纹身" name="tattoo">
              <uni-data-select v-model="formModel.tattoo" :localdata="labelState?.customer_info_tattoo" placeholder="请选择纹身">
              </uni-data-select>
            </uni-forms-item>
            <uni-forms-item label="民族" name="nation">
              <uni-data-select v-model="formModel.nation" :localdata="labelState?.customer_info_nation" placeholder="请选择民族">
              </uni-data-select>
            </uni-forms-item>
          </view>
        </uni-section>
        <uni-section title="银行卡信息" type="line">
          <view class="card">
            <uni-forms-item label="银行名称" name="bankName">
              <uni-easyinput type="text" v-model="formModel.bankName" placeholder="请填写银行名称" maxlength="50" />
            </uni-forms-item>
            <uni-forms-item label="开户支行" name="bankBranch">
              <uni-easyinput type="text" v-model="formModel.bankBranch" placeholder="请填写开户支行" maxlength="50" />
            </uni-forms-item>
            <uni-forms-item label="银行卡号" name="bankCard">
              <uni-easyinput type="number" v-model="formModel.bankCard" placeholder="请输入银行卡号" maxlength="30" />
            </uni-forms-item>
          </view>
        </uni-section>
        <uni-section title="紧急联系人信息" type="line">
          <view class="card">
            <uni-forms-item label="紧急联系人姓名" name="emergencyName">
              <uni-easyinput type="text" v-model="formModel.emergencyName" placeholder="请填写紧急联系人姓名" maxlength="20" />
            </uni-forms-item>
            <uni-forms-item label="联系人电话" name="emergencyPhone">
              <uni-easyinput type="number" v-model="formModel.emergencyPhone" placeholder="请填写联系人电话" maxlength="11" />
            </uni-forms-item>
            <uni-forms-item label="紧急联系人常住(收件)地址" name="emergencyAddress">
              <uni-easyinput type="text" v-model="formModel.emergencyAddress" placeholder="请填写地址" maxlength="100" />
            </uni-forms-item>
          </view>
        </uni-section>
        <uni-section title="学习/工作经历" type="line">
          <template v-slot:right>
            <button class="right-btn" @click="addExperience">添加经历</button>
          </template>
          <!-- <experience-edit :data="experience" @ok="handleExperienceOk"></experience-edit> -->
          <view class="exp-block" v-for="(id, index) in experience" :key="id">
            <view class="exp-header">
              <view class="exp-name">学习/工作经验{{index+1}}</view>
              <button plain class="delete-btn" @click="handleDel(id)">删除</button>
            </view>
            <uni-forms-item label="单位名称" name="company">
              <uni-easyinput v-model="experience[index][`company`]" placeholder="请输入学习/工作单位名称" />
            </uni-forms-item>
            <uni-forms-item label="岗位" name="position">
              <uni-easyinput v-model="experience[index][`position`]" placeholder="请输入岗位名称" />
            </uni-forms-item>
            <uni-forms-item label="开始时间" name="beginDate">
              <!-- <uni-datetime-picker type="date" return-type="date" v-model="experience[index][`beginDate`]" /> -->
              <picker mode="date" :end="endDate" :value="experience[index][`beginDate`]" @change="e => bindStartChange(e, index)">
                <view v-if="experience[index][`beginDate`]" class="uni-input">{{experience[index][`beginDate`] || '选择日期'}}</view>
                <view v-else class="uni-input uni-input--placehoder">选择日期</view>
              </picker>
            </uni-forms-item>
            <uni-forms-item label="结束时间" name="endDate">
              <picker mode="date" :end="endDate" :value="experience[index][`endDate`]" @change="e => bindEndChange(e, index)">
                <view v-if="experience[index][`endDate`]" class="uni-input">{{experience[index][`endDate`] || '选择日期'}}</view>
                <view v-else class="uni-input uni-input--placehoder">选择日期</view>
              </picker>
            </uni-forms-item>
            <uni-forms-item label="描述" name="desc">
              <uni-easyinput type="textarea" v-model="experience[index][`desc`]" placeholder="请输入学习/工作描述"></uni-easyinput>
            </uni-forms-item>
          </view>
          <!-- <view v-for="item in experience" :key="item.id" class="experience-item">
            <view class="experience-item-header">
              <view>{{item.company}}</view>
              <view class="experience-item-date-wrap">
                <text class="experience-item-date">{{item.beginDate}}至{{item.endDate}}</text>
                <uni-icons type='forward'></uni-icons>
              </view>
            </view>
            <view class="experience-item-position">{{item.position}}</view>
            <view class="experience-item-desc">{{item.desc}}</view>
          </view> -->
        </uni-section>
        <button class="save-btn" @click="submitForm" :loading="submitting">保存</button>
      </uni-forms>
    </template>
    <template v-else>
      <view v-if="!formModel || !formModel.resumeCreateTime">
        <swiper class="swiper" circular indicator-dots autoplay :interval="2000" :duration="500">
          <swiper-item>
            <image class="swiper-item" src="/static/1.png" />
          </swiper-item>
        </swiper>
        <data-empty text="暂无数据"></data-empty>
        <button class="create-btn" type="primary" @click="isEdit=true">去创建简历</button>
      </view>
      <view v-else></view>
    </template>
  </view>

</template>

<style scoped lang="scss">
  .container {
    min-height: 100vh;
    background-color: #f0f5f9;
    overflow: auto;
    padding-bottom: 60px;
  }

  .card {
    margin: 0 8px;
    background-color: #fff;
    border-radius: 4px;
    position: relative;
    padding: 10px 10px 2px 10px;
  }

  .uni-section {
    background-color: transparent;
  }

  .uni-forms-item {
    margin-left: 10px;
    margin-right: 10px;
  }

  .swiper-item {
    width: 100%;
  }

  .create-btn {
    margin-top: 20px;
    width: 250px;
    height: 40px;
    line-height: 40px;
    border-radius: 40px;
    background-color: $uni-primary;
    color: #fff;
  }

  .save-btn {
    width: 80%;
    height: 40px;
    line-height: 40px;
    border-radius: 10px;
    background-color: $uni-primary;
    color: #fff;
    position: fixed;
    bottom:15px;
    margin-left: 10%;
    z-index: 999;
  }

  .right-btn {
    width: 100px;
    height: 28px;
    line-height: 28px;
    border-radius: 5px;
    color: $uni-primary;
    border: 1px solid $uni-primary;
    font-size: 14px;
  }

  .experience-item {
    background-color: #ffff;
    margin: 0 8px 2px 8px;
    padding: 10px;
    border-radius: 4px;
    background-color: #fff;
  }

  .experience-item-header {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
  }

  .experience-item-date-wrap {
    display: flex;
    align-items: center;
  }

  .experience-item-date {
    color: #888;
    font-size: 12px;
  }

  .uni-input {
    padding-left: 24rpx;
    height: 36px;
    line-height: 36px;
    font-size: 28rpx;
    color: #333;
    border: 1px solid #e5e5e5;
    border-radius: 8rpx;
  }

  .uni-input--placehoder {
    color: #999;
    font-size: 26rpx;
  }

  .experience-item-position {
    margin: 5px 0;
    font-size: 14px;
    color: #888;
  }

  .experience-item-desc {
    font-size: 12px;
    color: #888;
    margin-top: 5px;
  }

  .user-info-card {
    padding: 5px 20px;
    font-size: 12px;
    color: #666;
    line-height: 1.6;
    min-height: 120px;
    position: relative;
  }

  .user-name {
    font-size: 14px;
    color: #333;
    font-weight: bold;
    margin-bottom: 5px;
  }

  .user-avatar-container {
    position: absolute;
    top: 10px;
    right: 20px;
    text-align: center;
  }

  .user-avatar {
    width: 50px;
    height: 70px;
    background-color: #e5e5e5;
    border-radius: 4px;
  }

  .user-title {
    color: red;
    font-size: 12px;
    text-align: center;
  }
  .exp-block {
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;
    padding: 10px;
  }

  .uni-forms-item__label {
    flex: 0.5;
  }

  .exp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f1f3ff;
    padding: 0 10px;
    margin: -10px -10px 10px;
  }

  .exp-name {
    flex: 0 0 140px;
    font-size: 12px;
  }
  .delete-btn {
    flex: 0 0 70px;
    margin: 0;
    color: #3f75ef;
    font-size: 12px;
    background-color: transparent;
    border-width: 0;
    width: 70px;
    &::before, &::after {
      border: none;
    }
  }
  
  .flex-info{
	  display: flex;
	  justify-items: center;
	  align-items: center;
  }
</style>

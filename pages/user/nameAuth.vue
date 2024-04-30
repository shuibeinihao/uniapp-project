<script setup lang="ts">
  import {
    reactive,
    ref
  } from 'vue';

  import {
    onLoad
  } from "@dcloudio/uni-app";
  import app from '../../utils/application';
  import request from '../../utils/request';
  import {
    regularIDCardNo,
    regularPhone,
    testIDCard,
  } from '../../utils/regulars';

  const sexs = [{
    text: '男',
    value: 'M'
  },
  {
    text: '女',
    value: 'F'
  },
  ]


  onLoad(() => {
    app.getUserInfo().then(data => {

      // if (data.phoneNumber && data.verify === 'T') {
      if (data.phoneNumber && data.customerName) {
        uni.navigateBack()
        return;
      }
      setTimeout(()=> {
        formModel.value = {
          phoneNumber: data.phoneNumber,
          customerName: data.customerName,
          sex: data.sex,
          idCard: data.idCard,
          nation: data.nation,
        }
      },1000)
      console.log('data', data)
      request({
        url: '/system/dict/data/listAll',
        method: 'get',
        data: {
          dictType: 'customer_info_nation'
        }
      }).then(res => {
        nations.value = res.data.map(item => ({
          text: item.dictLabel,
          value: item.dictValue
        }))
      })
    })
  })

  const nations = ref([])

  const formRef = ref(null)
  const formModel = ref<any>({})

  const rules = reactive({
    phoneNumber: {
      rules: [{
        required: true,
        errorMessage: '请输入手机号'
      }, {
        pattern: regularPhone,
        errorMessage: '手机号格式不正确'
      }]
    },
    customerName: {
      rules: [{
        required: true,
        errorMessage: '请输入姓名'
      }]
    },
    sex: {
      rules: [{
        required: true,
        errorMessage: '请输入性别'
      }]
    },
    nation: {
      rules: [{
        required: true,
        errorMessage: '请选择民族'
      }]
    },
    idCard: {
      rules: [{
        required: true,
        errorMessage: '请输入身份证号'
      }, {
        pattern: regularIDCardNo,
        errorMessage: '身份证号格式不正确'
      }]
    },
  })


  const submitting = ref(false)

  const submitForm = () => {
    formRef.value.validate().then(async (values) => {
      if (submitting.value) return;
      if (!values.password) {
        uni.showToast({
          icon: 'none',
          title: '请输入安全密码'
        });
        return;
      }
      if (values.password.length < 8) {
        uni.showToast({
          icon: 'none',
          title: '请输入安全密码至少8位字符'
        });
        return;
      }
      if (values.password !== values.passwordConfirm) {
        formModel.value = {
          ...formModel.value,
          passwordConfirm: ''
        }
        uni.showToast({
          icon: 'none',
          title: '密码不一致'
        });
        return;
      }
      if (!testIDCard(values.idCard)) {
        uni.showToast({
          icon: 'none',
          title: '身份证号格式不正确'
        });
        return;
      }

      submitting.value = true;
      try {
        const userInfoRes = await app.getUserInfo(true)
        await request({
          url: '/mobile/verifyCardNo',
          data: {
            ...values,
            openId: userInfoRes.openId,
            customerId: userInfoRes.customerId,
            verify: 'T',
            validUser: '1'
          }
        })
        uni.showToast({
          title: '认证成功',
          complete: () => {
            app.getUserInfo(true)
            setTimeout(() => {
              uni.reLaunch({ url: '/pages/user/index' })
            }, 1500)
          }
        })
      } catch (e) {
        submitting.value = false;
        uni.showToast({
          title: e.message,
          icon: 'none'
        })
      }
    })
  }

  const checked = ref(false);
  const checkChange = () => {
    checked.value = !checked.value;
  }


  const jumpprivacy = () => {
    uni.navigateTo({ url: '/pages/user/privacyPolicy' })
  }
  
  const jumpuser = () => {
    uni.navigateTo({
      url: '/pages/user/userAgreement'
    });
  }
</script>

<template>
  <view class="container">
    <uni-forms ref="formRef" :modelValue="formModel" :rules="rules" :label-width="90">
      <view class="card">
        <uni-section title="基础信息" type="line">
          <uni-forms-item label="手&nbsp;机&nbsp;号：" name="phoneNumber" required>
            <uni-easyinput type="text" v-model="formModel.phoneNumber" placeholder="请填写手机号" maxlength="11" />
          </uni-forms-item>
          <uni-forms-item label="姓&emsp;&emsp;名：" name="customerName" required>
            <uni-easyinput type="text" v-model="formModel.customerName" placeholder="请填写身份证上的姓名" maxlength="20" />
          </uni-forms-item>
          <uni-forms-item label="性&emsp;&emsp;别" name="sex" required>
            <view :style="{marginTop: '5px'}">
              <uni-data-checkbox v-model="formModel.sex" :localdata="sexs" />
            </view>

          </uni-forms-item>
          <uni-forms-item label="民&emsp;&emsp;族" name="nation" required>
            <uni-data-select v-model="formModel.nation" :localdata="nations" placeholder="请选择民族"></uni-data-select>
          </uni-forms-item>

          <uni-forms-item label="身份证号：" name="idCard" required>
            <uni-easyinput type="text" v-model="formModel.idCard" placeholder="请填写身份证号" maxlength="18" />
          </uni-forms-item>
        </uni-section>
      </view>
      <view class="card">
        <uni-section title="设置密码" type="line">
          <uni-forms-item label="安全密码：" name="password" required>
            <uni-easyinput type="password" v-model="formModel.password" placeholder="请设置密码,至少8个字符" />
          </uni-forms-item>
          <uni-forms-item label="确认密码：" name="passwordConfirm" required>
            <uni-easyinput type="password" v-model="formModel.passwordConfirm" placeholder="再次确认安全密码" />
          </uni-forms-item>
        </uni-section>
      </view>
      <view class="tip">
        <view>*基于法规要求和保障服务质量，或出现异常方便您维权，请实名认证。</view>
      </view>
      <view class="agree">
        <view class="checkbox" :class="{'un-checked': checked}" @click="checkChange">
          <uni-icons v-if="checked" type="checkmarkempty" size="12" color="#2979ff"></uni-icons>
        </view>
        <view class="readme">已阅读并同意<text class="a" @tap="jumpuser">《用户协议》</text>和
          <text class="a" @tap="jumpprivacy">《隐私政策》</text>
        </view>
      </view>
      <button class="btn" @click="submitForm" :disabled="!checked" :loading="submitting">确定</button>
    </uni-forms>
  </view>
</template>

<style scoped lang="scss">
  .container {
    min-height: 100vh;
    background-color: #f2f2f2;
    overflow: auto;
  }

  .card {
    margin: 8px;
    background-color: #fff;
    border-radius: 4px;
    position: relative;
    padding: 1px 10px;
  }

  .uni-forms-item {
    margin-left: 10px;
    margin-right: 10px;
  }

  .tip {
    font-size: 12px;
    color: #c0c0c0;
    margin-left: 10px;
  }

  .btn {
    width: 200px;
    height: 40px;
    line-height: 40px;
    margin: 20px auto;
    background-color: $uni-primary;
    color: #fff;
    border-radius: 25px;
    text-align: center;
    letter-spacing: 3px;
    &::after {
      border: none;
    }
  }
.agree {
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 0 20rpx;
  font-size: 24rpx;
  color: #cacaca;
  line-height: 34rpx;
  .checkbox {
    margin-right: 10rpx;
    width: 34rpx;
    height: 34rpx;
    line-height: 34rpx;
    border: 1rpx solid #cacaca;
    border-radius: 50%;
    text-align: center;
    background-color: #fff;
    &.un-checked {
      border-color: #cacaca;
      background-color: #fff;
    }
  }
  .readme {
    font-size: 24rpx;
    color: #5C616B;
    .a {
      color: #000000;
    }
  }
}
</style>
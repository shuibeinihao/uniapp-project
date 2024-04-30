<script setup lang="ts">
  import { reactive, ref, computed, onMounted, defineEmits, defineProps } from "vue";
  import {
    regularEmail
  } from '../../utils/regulars';
  import request from "../../utils/request";

  const props = defineProps<{
    data: any;
    labelState: any;
  }> ();

  const emit = defineEmits(['ok', 'close']);

  const popup = ref(null);

  onMounted(() => {
    popup.value.open();
  })

  const formModel = reactive < any > ({
    ...props.data
  })
  const formRef = ref();

  const rules = reactive({
    email: {
      rules: [{
        pattern: regularEmail,
        errorMessage: '邮箱格式不正确'
      }]
    },
    customerName: {
      rules: [{
        required: true,
        errorMessage: '请输入姓名'
      }]
    },
    cardOrg: {
      rules: [{
        required: true,
        errorMessage: '请输入身份证签发机关'
      }]
    },
    cardValidDate: {
      rules: [{
        required: true,
        errorMessage: '请输入身份证有效期'
      }]
    },
  })

  const handleSubmit = () => {
    formRef.value.validate().then(async (values) => {
      try {
        request({
          url: '/updateCustomerInfoByOpenId',
          data: formModel
        }).then(() => {
          emit('ok', {
            ...formModel
          })
        })
      } catch (e) {
        //TODO handle the exception
      }
    }).catch(err => console.log('err'))
  }

  const endDate = computed(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${year}-${month}-${day}`;
  });

  const close = () => {
    emit('close');
  }
</script>

<template>
  <uni-popup ref="popup" type="dialog" @maskClick="close">
    <!-- <uni-popup-dialog type="info" title="编辑用户" :duration="2000" confirmText="保存" :before-close="true" style="padding: 0;" @close="close" @confirm="handleSubmit"> -->
    <view class="user-info-container">
      <view class="content">
        <uni-forms ref="formRef" :modelValue="formModel" :label-width="80">
          <uni-forms-item label="姓名" required style="margin-bottom: 0;">
            <view class="form-value">{{formModel.customerName}}</view>
          </uni-forms-item>
          <uni-forms-item label="昵称" name="nickName">
            <uni-easyinput v-model="formModel.nickName" placeholder="请输入昵称" />
          </uni-forms-item>
          <uni-forms-item label="就业方向" name="title">
            <uni-data-select v-model="formModel.title" :localdata="props.labelState?.customer_info_title"
              placeholder="请选择就业方向"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="分类" name="type">
            <uni-data-select v-model="formModel.type" :localdata="props.labelState?.customer_info_type"
              placeholder="请选择分类"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="纹身" name="tattoo">
            <uni-data-select v-model="formModel.tattoo" :localdata="props.labelState?.customer_info_tattoo" placeholder="请选择纹身">
            </uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="学历" name="education">
            <uni-data-select v-model="formModel.education" :localdata="props.labelState?.customer_info_education"
              placeholder="请选择学历"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="拨号情况" name="dialState">
            <uni-data-select v-model="formModel.dialState" :localdata="props.labelState?.customer_info_dial_state"
              placeholder="请选择拨号情况"></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="备注" name="remark">
            <uni-easyinput type="textarea" v-model="formModel.remark" :maxlength="200" placeholder="请输入沟通情况备注1-200字" />
          </uni-forms-item>
          <!-- <button class="save-btn" @click="handleSubmit">保存</button> -->
        </uni-forms>
      </view>
      <view class="btns">
        <button class="cancel" @click="close">取消</button>
        <button class="save" @click="handleSubmit">保存</button>
      </view>
    </view>
    <!-- </uni-popup-dialog> -->
  </uni-popup>
</template>

<style lang="scss" scoped>
  .user-info-container {
    position: relative;
    width: 560rpx;
    padding: 24rpx 24rpx 100rpx;
    background-color: #fff;
    z-index: 1;
    border-radius: 16rpx;
    overflow: hidden;
  }
  .content {
    height: 70vh;
    overflow: auto;
  }
  .btns {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    display: flex;
    align-items: center;
    border-top: 1px solid #eee;
    button {
      flex: 1;
      background-color: #fff;
      border-radius: 0;
      &::after {
        border: none;
      }
      & + button {
        border-left: 1px solid #eee;
      }
    }
    .save {
      color: #2979ff;
    }
  }

  .form-value {
    height: 36px;
    line-height: 36px;
  }

  .user-info-block {
    border: 1px solid #c5c5c5;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 10px;
    padding: 10px;
  }

  .uni-forms-item__label {
    flex: 0.5;
  }

  .user-info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f1f3ff;
    padding: 0 10px;
    margin: -10px -10px 10px;
  }

  .user-info-name {
    flex: 1;
    font-size: 12px;
  }

  .save-btn {
    width: 100%;
    margin-top: 20px;
    height: 40px;
    line-height: 40px;
    color: #fff;
    text-align: center;
    font-size: 14px;
    background-color: #3f75ef;
  }



  .add-btn {
    background-color: transparent;
    border-width: 0;
    color: #3f75ef;
    font-size: 14px;
  }

  .delete-btn {
    color: #3f75ef;
    font-size: 12px;
    background-color: transparent;
    border-width: 0;
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
</style>
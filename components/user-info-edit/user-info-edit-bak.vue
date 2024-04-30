<script setup lang="ts">
  import dayjs from "dayjs";
  import {
    reactive,
    ref,
    computed
  } from "vue";
  import {
    regularEmail
  } from '../../utils/regulars'
  import {
    uploadFile
  } from "../../utils/request";

  const avatarFile = ref()

  const props = defineProps<{
    data: any;
    labelState: any;
  }> ();
  const emit = defineEmits < {
    (event: 'ok', value: any): void;
  } > ();
  const formModel = reactive < any > ({
    ...props.data,
    avatarObj: props.data.avatar ? {
      name: 'image',
      extname: props.data.avatar.slice(-3),
      url: props.data.avatar,
    } : undefined
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
      const files = avatarFile.value.filesList
      if (!files || !files[0]) {
        uni.showToast({
          icon: 'none',
          title: '请上传头像',
        });
        return;
      }
      try {
        const uploadRes = files[0].image ? await uploadFile({
          filePath: files[0].url,
        }) : files[0].url

        emit('ok', {
          ...formModel,
          avatar: uploadRes,
          // cardValidDate: formModel.cardValidDate ? dayjs(formModel.cardValidDate).format('YYYY-MM-DD') : ''
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

  const bindEndChange = (e) => {
    formModel.cardValidDate = e.detail.value;
  }
</script>

<template>
  <view class="user-info-container">
    <uni-forms ref="formRef" :modelValue="formModel" :label-width="120" :rules="rules">
      <uni-forms-item label="头像" required>
        <uni-file-picker ref="avatarFile" return-type="object" :auto-upload="false" fileMediatype="image"
          v-model="formModel.avatarObj" sizeType="['compressed']" fileExtname="png,jpg"
          :imageStyles="{width: 100, height: 140}">
        </uni-file-picker>
      </uni-forms-item>
      <uni-forms-item label="姓名" required>
        <view class="form-value">{{formModel.customerName}}</view>
      </uni-forms-item>
      <uni-forms-item label="电话" required>
        <view class="form-value">{{formModel.phoneNumber}}</view>
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
      <uni-forms-item label="身份证签发机关" name="cardOrg" required>
        <uni-easyinput v-model="formModel.cardOrg" placeholder="请输入身份证签发机关" />
      </uni-forms-item>
      <uni-forms-item label="身份证有效期" name="cardValidDate" required>
        <!-- <uni-datetime-picker type="date" return-type="date" v-model="formModel.cardValidDate" /> -->
        <picker mode="date" :end="endDate" :value="formModel.cardValidDate" @change="bindEndChange">
          <view v-if="formModel.cardValidDate" class="uni-input">{{formModel.cardValidDate}}</view>
          <view v-else class="uni-input uni-input--placehoder">选择日期</view>
        </picker>
      </uni-forms-item>
      <uni-forms-item label="学历" name="education">
        <uni-data-select v-model="formModel.education" :localdata="props.labelState?.customer_info_education"
          placeholder="请选择学历"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item label="就业方向" name="title">
        <uni-data-select v-model="formModel.title" :localdata="props.labelState?.customer_info_title"
          placeholder="请选择就业方向"></uni-data-select>
      </uni-forms-item>
      <uni-forms-item label="纹身" name="tattoo">
        <uni-data-select v-model="formModel.tattoo" :localdata="props.labelState?.customer_info_tattoo" placeholder="请选择纹身">
        </uni-data-select>
      </uni-forms-item>
      <button class="save-btn" @click="handleSubmit">保存</button>

    </uni-forms>
  </view>
</template>

<style scoped>
  .user-info-container {
    padding: 10px;
    background-color: #fff;
    z-index: 1;
    padding-bottom: 50px;
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

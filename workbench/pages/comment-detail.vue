<template>
  <view class="container">
    <uni-forms ref="formRef" :modelValue="formModel" :rules="rules" :label-width="90">
      <uni-section title="安置信息" type="line">
        <view class="card-detail">
          <uni-list>
            <uni-list-item title="经纪人" :rightText="formModel.agentName" />
            <uni-list-item title="面试时间" :rightText="formModel.interviewDate" />
            <uni-list-item title="类型" :rightText="formModel.positionTypeName" />
            <uni-list-item title="企业简称" :rightText="formModel.enterpriseSimpleName" />
            <uni-list-item title="工种" :rightText="formModel.workTypeName" />
            <uni-list-item title="报价" :rightText="formModel.offerPriceName" />
            <uni-list-item title="招聘政策" :note="formatRichTextToText(formModel.recruitPolicy)" />
            <uni-list-item title="入职须知" :note="formatRichTextToText(formModel.inductionNoticy)" />
            <uni-list-item title="服务商" :rightText="formModel.serviceName" />
          </uni-list>
        </view>
      </uni-section>
      <uni-section title="求职者" type="line">
        <view class="card-detail">
          <uni-list>
            <uni-list-item title="姓名" :rightText="formModel.customerName" />
            <uni-list-item title="性别" :rightText="getRowsName(formModel.sex, sexArr)" />
            <uni-list-item title="年龄" :rightText="formModel.age" />
            <uni-list-item title="户籍" :rightText="formModel.birthAddress" />
            <uni-list-item title="民族" :rightText="getRowsName(formModel.nation, labelState?.data?.customer_info_nation)" />
            <uni-list-item title="身份证号码" :rightText="formModel.idCard" />
            <uni-list-item title="手机号" :rightText="formModel.phoneNumber" />
          </uni-list>
        </view>
      </uni-section>
      <uni-section title="反馈信息" type="line">
        <view class="card-detail">
          <uni-list>
            <uni-list-item title="类型" :rightText="formModel.commentTypeName" />
            <uni-list-item title="在离职状态" :rightText="formModel.positionStateName" />
            <uni-list-item title="日期" :rightText="formModel.positionDate" />
            <uni-list-item title="工号" :rightText="formModel.employeeNo" />
            <uni-list-item title="诉求" :note="formModel.comment" />
          </uni-list>
        </view>
      </uni-section>
      <uni-section title="官方回复" type="line">
        <uni-list v-if="formModel.satisfyDegreeName">
          <uni-list-item title="满意度" :rightText="formModel.satisfyDegreeName" />
        </uni-list>
        <view style="margin-top: 8rpx;padding: 0 15px;">
          <uni-forms-item label="回复内容" required name="reply">
            <uni-easyinput type="textarea" autoHeight v-model="formModel.reply" placeholder="请输入回复内容" maxlength="500"></uni-easyinput>
          </uni-forms-item>
        </view>
      </uni-section>
    </uni-forms>
    <view class="footer">
      <button class="save-btn" @click="submitForm" :loading="submitting">提交回复</button>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { onLoad } from "@dcloudio/uni-app";
  import app from '../../utils/application';
  import request from '../../utils/request';
  import { useRequest } from '@/utils/hooks';
  import { sexArr } from '@/constants';
  import { getRowsName, formatRichTextToText } from '@/utils';
  import dayjs from 'dayjs';

  const commentId = ref(null);
  const formRef = ref(null)
  const formModel = ref <any> ({})

  const satisfyDegree = ref([
    { value: '3', text: '满意'},
    { value: '2', text: '一般'},
    { value: '1', text: '不满意'}
  ])

  onLoad((options) => {
    commentId.value = options.id;
    if (options.id) {
      request({
        url: '/placement/comment/getInfoById',
        method: 'get',
        data: { commentId: options.id }
      }).then((res) => {
        formModel.value = res.data;
      })
    }
  });

  const { state: labelState } = useRequest({
    url: '/system/dict/data/listAll',
    method: 'get',
    params: { dictType: 'customer_info_nation' },
    formatted: (res : any) => {
      const data : Record<string, Array<{
        key: string; name: string;
      }>> = {}
      if (Array.isArray(res)) {
        res.forEach((item: any) => {
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
  });

  const rules = reactive({
    comment: {
      reply: [{
        required: true,
        errorMessage: '请输入'
      }]
    }
  })

  const submitting = ref(false)

  const submitForm = () => {
    formRef.value.validate().then(async (values) => {
      if (submitting.value) return;
      submitting.value = true;
      try {
        const params = {
          commentId: formModel.value.commentId,
          reply: values.reply,
        }
        let url = '/placement/comment/modify';
        await request({ url, data: params });
        submitting.value = false;
        uni.showToast({
          title: '操作成功',
          duration: 1500,
          complete: () => {
            uni.navigateBack({ delta: 1 })
          }
        })
        uni.$emit('comment:reload');
      } catch (e) {
        uni.showToast({ title: e.message || '保存失败', icon: 'none' })
        submitting.value = false;
      }
    }).catch(err => console.log('err'))
  }

  const submitRate = () => {
    if (!formModel.value.satisfyDegree) {
      uni.showToast({ title: '请选择评分', icon: 'none' });
      return;
    }
    submitting.value = true;
    request({
      url: '/placement/comment/satisfy',
      data: {
        commentId: formModel.value.commentId,
        satisfyDegree: formModel.value.satisfyDegree
      }
    }).then(() => {
      submitting.value = false;
      uni.showToast({
        title: '提交成功',
        duration: 1500,
        complete: () => {
          uni.navigateBack({ delta: 1 })
        }
      })
    }).catch(err => {
      uni.showToast({ title: err.message || '提交失败', icon: 'none' })
      submitting.value = false;
    });
  }

  const onPositionStateChange = (value) => {
    if (['2', '5'].includes(value)) {
      formModel.value.positionDate = dayjs().format('YYYY-MM-DD');
    } else {
      formModel.value.positionDate = '';
    }
  };

  const bindPositionDateChange = (e) => {
    formModel.value.positionDate = e.detail.value;
  };
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding-bottom: 140rpx;
  background-color: #fff;
  overflow: auto;
  .card {
    position: relative;
    padding: 1px 10px;
    background-color: #fff;
    border-radius: 4px;
    .uni-input {
      padding-left: 10px;
      height: 70rpx;
      line-height: 70rpx;
      border: 1px solid #F0F0F0;
      border-radius: 8rpx;
      &--placehoder {
        color: #b3b3b3;
      }
    }
    .detail {
      height: 70rpx;
      line-height: 70rpx;
    }
  }

  .form-item-content {
    padding-top: 8rpx;
  }

  .save-btn {
    height: 40px;
    line-height: 40px;
    background-color: $uni-primary;
    color: #fff;
  }

  .footer {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 16rpx 32rpx 32rpx;
    box-sizing: border-box;
    background-color: #fff;
    box-shadow: -2rpx 0 10rpx 0 rgba(51, 51, 51, 0.3);
    z-index: 9;
  }
}

</style>

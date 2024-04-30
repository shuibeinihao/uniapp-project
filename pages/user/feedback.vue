<template>
  <view class="container">
    <uni-forms ref="formRef" :modelValue="formModel" :rules="rules" :label-width="90">
      <view v-if="formModel.processState !== '2'" class="card">
        <uni-forms-item label="安置记录" name="positionId">
          <uni-data-select v-model="formModel.positionId" :localdata="list" placeholder="请选择安置记录"></uni-data-select>
        </uni-forms-item>
        <uni-forms-item label="类型" required name="commentType">
          <multiple-select
            v-model="formModel.commentType"
            zindex="2"
            placeholder="请选择类型"
            :options="labelState?.data?.comment_info_comment_type"
          ></multiple-select>
        </uni-forms-item>
        <uni-forms-item label="在离职状态" required name="positionState">
          <uni-data-select v-model="formModel.positionState" :localdata="positionStateDict" placeholder="请选择在离职状态" @change="onPositionStateChange"></uni-data-select>
        </uni-forms-item>
        <uni-forms-item label="日期" required name="positionDate">
          <picker mode="date" :disabled="['2', '5'].includes(formModel.positionState)" :value="formModel.positionDate" @change="bindPositionDateChange">
            <view v-if="formModel.positionDate" class="uni-input">{{formModel.positionDate}}</view>
            <view v-else class="uni-input uni-input--placehoder">选择日期</view>
          </picker>
        </uni-forms-item>
        <uni-forms-item label="工号" name="employeeNo">
          <uni-easyinput v-model="formModel.employeeNo" placeholder="请输入工号" />
        </uni-forms-item>
        <uni-forms-item label="诉求" required name="comment">
          <uni-easyinput type="textarea" autoHeight v-model="formModel.comment" placeholder="请输入诉求" maxlength="500"></uni-easyinput>
        </uni-forms-item>
      </view>
      <uni-section v-else title="反馈信息" type="line">
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
      <uni-section v-if="['1', '2'].includes(formModel.processState)" title="官方回复" type="line">
        <uni-list>
          <uni-list-item title="回复内容" :note="formModel.reply" />
        </uni-list>
        <view v-if="formModel.processState === '2'" style="padding: 0 15px;">
          <uni-forms-item label="满意度评价" name="satisfyDegree">
            <view class="form-item-content">
              <uni-data-checkbox v-model="formModel.satisfyDegree" :localdata="satisfyDegree"></uni-data-checkbox>
            </view>
          </uni-forms-item>
        </view>
      </uni-section>
    </uni-forms>
    <view class="footer">
      <button v-if="formModel.processState === '2'" class="save-btn" @click="submitRate" :loading="submitting">提交评价</button>
      <button v-else class="save-btn" @click="submitForm" :loading="submitting">提交</button>
    </view>
  </view>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { onLoad } from "@dcloudio/uni-app";
  import app from '../../utils/application';
  import request from '../../utils/request';
  import { useRequest } from '@/utils/hooks';
  import dayjs from 'dayjs';

  const commentId = ref(null);
  const formRef = ref(null)
  const formModel = ref <any> ({
    commentType: ''
  })

  const positionStateDict = ref([{ value: '1', text: '劳动关系变更'},
    { value: '2', text: '当前还在职'},
    { value: '3', text: '非正常离职(自离)'},
    { value: '4', text: '正常离职'},
    { value: '5', text: '其它'}
  ])

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
        formModel.value.commentId = res.data.commentId;
        formModel.value.commentType = res.data.commentType;
        formModel.value.commentTypeName = res.data.commentTypeName;
        formModel.value.positionId = res.data.positionId;
        formModel.value.positionState = res.data.positionState;
        formModel.value.positionStateName = res.data.positionStateName;
        formModel.value.positionDate = res.data.positionDate;
        formModel.value.employeeNo = res.data.employeeNo;
        formModel.value.comment = res.data.comment;
        formModel.value.processState = res.data.processState;
        formModel.value.satisfyDegree = res.data.satisfyDegree;
        formModel.value.reply = res.data.reply;
      })
    }
    loadReplacement();
  });

  const list = ref([]);

  const loadReplacement = () => {
    app.getUserInfo(true).then(res => {
      request({
        url: '/mobile/position/private/list',
        method: 'get',
        data: {
          customerId: res.customerId,
        }
      }).then(res => {
        uni.hideLoading()
        const data = res.data || [];
        data.sort((a,b)=> {
          return dayjs(a.signTime) > dayjs(b.signTime) ? -1 : 1
        });
        list.value = data.map(item => {
          return {
            value: item.id,
            text: `${item.enterpriseSimpleName}(${item.interviewDate})`
          }
        });
      }).catch((err) => {
        uni.showToast({
          icon: 'none',
          title: err.message
        })
      })
    })
  };

  const { state: labelState } = useRequest({
    url: '/system/dict/data/listAll',
    method: 'get',
    params: { dictType: 'comment_info_comment_type' },
    formatted: (res : any) => {
      const data : Record<string, Array<{
        value: string; text: string;
      }>> = {}
      if (Array.isArray(res)) {
        res.forEach((item: any) => {
          const key = `${item.dictType}`
          if (!data[key]) {
            data[key] = [{ value: item.dictValue, text: item.dictLabel }]
          } else {
            data[key].push({ value: item.dictValue, text: item.dictLabel})
          }
        })
      }
      return data;
    }
  });

  const rules = reactive({
    commentType: {
      rules: [{
        required: true,
        errorMessage: '请选择'
      }]
    },
    positionState: {
      rules: [{
        required: true,
        errorMessage: '请选择'
      }]
    },
    positionDate: {
      rules: [{
        required: true,
        errorMessage: '请选择'
      }]
    },
    employeeNo: {
      rules: [{
        required: false,
        errorMessage: '请输入工号'
      }]
    },
    comment: {
      rules: [{
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
          ...formModel.value
        }
        let url = '/placement/comment/create';
        if (formModel.value.commentId) {
          url = '/placement/comment/modify';
        }
        await request({ url, data: params });
        submitting.value = false;
        uni.showToast({
          title: '操作成功',
          duration: 1500,
          complete: () => {
            uni.navigateBack({ delta: 1 })
          }
        })
        uni.$emit('feedback:reload');
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

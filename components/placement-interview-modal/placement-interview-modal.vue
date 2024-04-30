<template>
  <uni-popup ref="popup" type="dialog" @maskClick="close">
    <view class="interview-container">
      <view class="title">设置面试</view>
      <view class="content">
        <uni-forms ref="formRef" :modelValue="formModel" :rules="rules" :label-width="80">
          <uni-forms-item label="面试状态" name="interviewState">
            <uni-data-select
              v-model="formModel.interviewState"
              :localdata="localdata"
              placeholder="请选择面试状态"
            ></uni-data-select>
          </uni-forms-item>
          <uni-forms-item label="面试说明" name="interviewDesc">
            <uni-easyinput
              type="textarea"
              v-model="formModel.interviewDesc"
              :maxlength="200"
              placeholder="请输入面试说明1-50字"
            />
          </uni-forms-item>
        </uni-forms>
      </view>
      <view class="btns">
        <button class="cancel" @click="close">取消</button>
        <button class="save" @click="handleSubmit">保存</button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import {
  reactive,
  ref,
  computed,
  onMounted,
  defineEmits,
  defineProps,
} from "vue";
import request from "../../utils/request";
import { interviewStatusArr } from "@/constants";

const props = defineProps<{
  data: any;
  labelState: any;
}>();

const emit = defineEmits(["ok", "close"]);

const popup = ref(null);

const localdata = computed(() => {
  const list = interviewStatusArr.map((item) => {
    return {
      value: item.value,
      text: item.label,
    };
  })
  list.unshift({
    value: null,
    text: '?'
  });
  return list;
});

onMounted(() => {
  popup.value.open();
});

const formModel = reactive<any>({
  ...props.data,
  avatarObj: props.data.avatar
    ? {
        name: "image",
        extname: props.data.avatar.slice(-3),
        url: props.data.avatar,
      }
    : undefined,
});
const formRef = ref();

const rules = reactive({
  // interviewState: {
  //   rules: [
  //     {
  //       required: true,
  //       errorMessage: "请选择面试状态",
  //     },
  //   ],
  // }
});

const handleSubmit = () => {
  formRef.value
    .validate()
    .then(async (values) => {
      try {
        const params = {
          id: props.data.id,
          ...values,
        }
        request({
          url: "/placement/position/modify",
          data: params,
        }).then(() => {
          emit("ok");
        });
      } catch (e) {
        //TODO handle the exception
      }
    })
    .catch((err) => console.log("err"));
};

const close = () => {
  emit("close");
};
</script>
<style lang="scss" scoped>
.interview-container {
  position: relative;
  width: 560rpx;
  padding: 24rpx 24rpx 100rpx;
  background-color: #fff;
  z-index: 1;
  border-radius: 16rpx;
  overflow: hidden;
  .title {
    margin-bottom: 32rpx;
    font-size: 34rpx;
    font-weight: bold;
    color: #303133;
    text-align: center;
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
      color: #606266;
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
}
</style>

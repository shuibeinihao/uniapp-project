<template>
  <!-- <view class="uni-select-dc" :style="{ 'z-index': zindex }"> -->
  <view class="uni-select-dc" :style="{ 'z-index': zindex }">
    <view
      class="uni-select-dc-select"
      :class="{ active: active }"
      @click.stop="handleSelect"
    >
      <!-- 禁用mask -->
      <view class="uni-disabled" v-if="disabled"></view>
      <!-- 清空 -->
      <view
        class="close-icon close-postion"
        v-if="realValue.length && !active && !disabled && showClearIcon"
      >
        <text @click.stop="handleRemove(null)"></text>
      </view>
      <!-- 显示框 -->
      <view class="uni-select-multiple" v-show="realValue.length">
        <view
          class="uni-select-multiple-item"
          v-for="(item, index) in changevalue"
          :key="index"
        >
          {{ item.text }}
          <view class="close-icon" v-if="showValueClear"
            ><text @click.stop="handleRemove(index)"></text>
          </view>
        </view>
      </view>
      <!-- 为空时的显示文案 -->
      <view v-if="realValue.length == 0 && showplaceholder">{{
        placeholder
      }}</view>
      <!-- 禁用图标 -->
      <view class="uni-select-dc-icon" :class="{ disabled: disabled }">
        <uni-icons class="icon" type="down" size="14" color="#999"></uni-icons>
      </view>
    </view>
    <view v-show="active" class="uni-select--mask" @click="close"></view>
    <!-- 下拉选项 -->
    <scroll-view class="uni-select-dc-options" :scroll-y="true" v-show="active">
      <template>
        <view
          class="uni-select-dc-item"
          :class="{ active: realValue.includes((item as any)[svalue]) }"
          v-for="(item, index) in options"
          :key="index"
          @click.stop="handleChange(index, item)"
        >
          {{ (item as any)[slabel] }}
        </view>
      </template>
    </scroll-view>
  </view>
</template>
 
<script lang="ts" setup>
import { onMounted, watch, reactive, ref } from "vue";
 
const props = defineProps({
  // 是否显示全部清空按钮
  showClearIcon: {
    type: Boolean,
    default: false,
  },
  // 是否显示单个删除
  showValueClear: {
    type: Boolean,
    default: true,
  },
  zindex: {
    type: Number,
    default: 999,
  },
  // 禁用组件
  disabled: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    default() {
      return [];
    },
  },
  modelValue: {
    type: [Array, String],
    default() {
      return [];
    },
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
  showplaceholder: {
    type: Boolean,
    default: true,
  },
  slabel: {
    type: String,
    default: "text",
  },
  svalue: {
    type: String,
    default: "value",
  },
});
const emit = defineEmits(["change", "update:modelValue"]);
const active = ref<boolean>(false); // 组件是否激活，
let changevalue = ref<Record<any, any>>([]);
let realValue = reactive<Record<string, any>>([]);
onMounted(() => {
  init();
});

// 监听value变化
watch(() => props.modelValue, (val) => {
  init();
});

watch(() => props.options, (val) => {
  init();
});

const close = () => {
  active.value = false;
};
// 初始化函数
const init = () => {
  changevalue.value = [];
  // 判断value是否是逗号分隔的字符串
  let values = props.modelValue;
  if (typeof props.modelValue === "string" && props.modelValue.length > 0) {
    values = props.modelValue.split(",");
  }
  if (values.length > 0) {
    props.options.forEach((item) => {      
      values.forEach((i) => {
        if ((item as any)[props.svalue] === i) {
          changevalue.value.push(item);
        }
      })
    })
    realValue = values;
    
  } else {
    changevalue.value = [];
    realValue = [];
  }
};
// 点击展示选项
const handleSelect = () => {
  if (props.disabled) return;
  active.value = !active.value;
};
// 移除数据
const handleRemove = (index:any) => {
  if (index === null) {
    realValue = [];
    changevalue.value = [];
  } else {
    realValue.splice(index, 1);
    changevalue.value.splice(index, 1);
  }
  emit("change", changevalue.value, realValue);
  // 如果是字符串，返回逗号分隔的字符串
  emit("update:modelValue", typeof props.modelValue === "string" ? realValue.join(",") : realValue);
};
// 点击组件列
const handleChange = (index, item) => {
  const arrIndex = realValue.indexOf(item[props.svalue]);
  
  if (arrIndex > -1) {
    changevalue.value.splice(arrIndex, 1);
    realValue.splice(arrIndex, 1);
  } else {
    changevalue.value.push(item);
    realValue.push(item[props.svalue]);
  }
  emit("change", changevalue.value, realValue);
  // 如果是字符串，返回逗号分隔的字符串
  emit("update:modelValue", typeof props.modelValue === "string" ? realValue.join(",") : realValue);
};
</script>
 
<style lang="scss" scoped>
.uni-select-dc {
  position: relative;
  z-index: 999;
 
  .uni-select-mask {
    width: 100%;
    height: 100%;
  }
 
  /* 删除按钮样式*/
  .close-icon {
    height: 100%;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    // z-index: 3;
    cursor: pointer;
 
    text {
      position: relative;
      background: #c0c4cc;
      width: 13px;
      height: 13px;
      border-radius: 50%;
      border: 1px solid #bbb;
 
      &::before,
      &::after {
        content: "";
        position: absolute;
        left: 20%;
        top: 50%;
        height: 1px;
        width: 60%;
        transform: rotate(45deg);
        background-color: #909399;
      }
 
      &::after {
        transform: rotate(-45deg);
      }
    }
  }
 
  //所有情空的定位
  .close-postion {
    position: absolute;
    right: 35px;
    top: 0;
    height: 100%;
    width: 15px;
  }
 
  /* 多选盒子 */
  .uni-select-multiple {
    display: flex;
    flex-wrap: wrap;
    overflow: scroll;
 
    .uni-select-multiple-item {
      background: #f4f4f5;
      margin-right: 5px;
      padding: 2px 4px;
      border-radius: 4px;
      color: #909399;
      display: flex;
      flex-shrink: 0;
    }
  }
 
  // select部分
  .uni-select-dc-select {
    user-select: none;
    position: relative;
    z-index: 1;
    min-height: 36px;
    padding: 0 30px 0 10px;
    box-sizing: border-box;
    border-radius: 4px;
    border: 1px solid rgb(229, 229, 229);
    display: flex;
    align-items: center;
    font-size: 12px;
    color: #999;
    min-width: 210px;
 
    .uni-disabled {
      position: absolute;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 19;
      cursor: no-drop;
      background: rgba(255, 255, 255, 0.5);
    }
 
    .uni-select-dc-input {
      font-size: 14px;
      color: #999;
      display: block;
      width: 96%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      line-height: 30px;
      box-sizing: border-box;
 
      &.active {
        color: #333;
      }
    }
 
    .uni-select-dc-icon {
      cursor: pointer;
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
 
      &::before {
        content: "";
        // width: 1px;
        // height: 100%;
        // position: absolute;
        // left: 0;
        // top: 0;
        // background-color: #e5e5e5;
      }
 
      .icon {
        display: block;
        transition: 0.3s;
      }
 
      &.disabled {
        cursor: no-drop;
 
        .icon {
          width: 20rpx;
          height: 20rpx;
          border: 2px solid #ff0000;
          border-radius: 50%;
          transition: 0.3s;
          position: relative;
          z-index: 999;
 
          &::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 2px;
            margin-top: -1px;
            background-color: #ff0000;
            transform: rotate(45deg);
          }
        }
      }
    }
 
    &.active .uni-select-dc-icon {
      .icon {
        transform: rotate(180deg);
      }
    }
  }
 
  .uni-select--mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  // options部分
  .uni-select-dc-options {
    user-select: none;
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    height: 400rpx;
    border-radius: 4px;
    border: 1px solid rgb(229, 229, 229);
    background: #fff;
    padding: 5px 0;
    box-sizing: border-box;
    z-index: 9;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
 
    .uni-select-dc-item {
      padding: 0 10px;
      box-sizing: border-box;
      cursor: pointer;
      line-height: 2.5;
      transition: 0.3s;
      font-size: 14px;
 
      &.active {
        color: #409eff;
 
        background-color: #f5f7fa &hover {
          color: #409eff;
          background-color: #f5f7fa;
        }
      }
 
      &:hover {
        background-color: #f5f5f5;
      }
    }
  }
}
</style>
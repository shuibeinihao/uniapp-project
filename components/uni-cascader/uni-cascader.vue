<template>
  <view class="uni-data-input">
    <view class="selected-item" :class="{placeholder: !innerValue}" @click="handleInput">{{ innerText || '选择城市' }}</view>
    <uni-icons v-if="innerValue" class="clear" @click.stop="handleClear" color="#c0c4cc" type="clear" size="20"></uni-icons>
  </view>
  <uni-popup ref="popup" type="bottom" :safe-area="false">
    <view class="uni-cascader">
      <view v-if="showHeader" class="uni-cascader__header">
        <view class="uni-cascader__close" @click="hide">取消</view>
        <text class="uni-cascader__title"><slot name="title"></slot>{{ title }}</text>
        <view class="uni-cascader__confirm" @click="confirm">确定</view>
      </view>
      <view class="uni-cascader__tabs">
        <scroll-view :scroll-x="true" class="uni-tabs__wrap">
          <view class="uni-tabs__nav">
            <view v-for="(tab, index) in tabs" :key="index"
              class="uni-tab uni-cascader__tab"
              :class="{'uni-tab--active': activeTab === index, 'uni-cascader__tab--unselected': activeTab !== index}"
              :style="!tab.selected ? 'color: #969799;font-weight:normal;' : ''"
              @click="onClickTab(index, tab)"
            >
              <view class="uni-tab__text">{{ tab.selected ? tab.selected[textKey] : '请选择' }}</view>
            </view>
          </view>
        </scroll-view>
        <view class="uni-tabs__content" v-for="(tab, index) in tabs" :key="index" v-show="index === activeTab">
          <view class="uni-cascader__options">
            <view class="uni-cascader__option" :class="{'uni-cascader__option--selected': isSelected(tab, option)}" v-for="(option, idx) in tab.options" :key="`${index}_${idx}`" @click="onSelect(option, index)">
              <text>{{ option[textKey] }}</text>
              <uni-icons v-if="isSelected(tab, option)" type="checkmarkempty" :color="isSelected(tab, option) ? '#2979ff' : ''" size="18" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, nextTick, watch, onMounted } from 'vue';

enum FieldName {
  TEXT = 'text',
  VALUE = 'value',
  CHILDREN = 'children'
}

type Option = Record<string, any>;

interface ITab {
  options: Option[];
  selected: Option | null;
}

const defaultFieldNames = {
  text: FieldName.TEXT,
  value: FieldName.VALUE,
  children: FieldName.CHILDREN
};

const props = defineProps({
  title: String,
  modelValue: {
    type: String,
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  activeColor: {
    type: String,
    default: '#1989fa',
  },
  options: {
    type: Array,
    default: [],
  },
  closeable: {
    type: Boolean,
    default: true,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  fieldNames: {
    type: Object,
    default: () => {},
  }
});

const emit = defineEmits(['click-tab', 'change', 'finish', 'close', 'confirm', 'update:modelValue']);

const tabs = ref<ITab[]>([]);
const activeTab = ref(0);
let textKey = FieldName.TEXT;
let valueKey = FieldName.VALUE;
let childrenKey = FieldName.CHILDREN;
const innerValue = ref('');
const innerText = ref('');

onMounted(() => {
  updateTabs();
});

const getSelectedOptionsByValue = (options: Array<any>, value: string) => {
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    
    if (option[valueKey] === value) {
      return [option];
    }

    if (option[childrenKey]) {
      const selectedOptions = getSelectedOptionsByValue(option[childrenKey], value);
      if (selectedOptions) {
        return [option, ...selectedOptions];
      }
    }
  }
};

const updateTabs = () => {
  if (!props.options.length) {
    return;
  }
  if (innerValue.value !== undefined) {
    const selectedOptions = getSelectedOptionsByValue(props.options, innerValue.value);
    if (selectedOptions) {
      let optionsCursor = props.options;
      const tabs1 = selectedOptions.map((option) => {
        const tab = {
          options: optionsCursor,
          selected: option,
        };

        const next = optionsCursor.find((item) => item[valueKey] === option[valueKey]);
        if (next) {
          optionsCursor = next[childrenKey];
        }
        return tab;
      });

      if (optionsCursor) {
        tabs1.push({
          options: optionsCursor,
          selected: null,
        });
      }

      nextTick(() => {
        tabs.value = tabs1;
        activeTab.value = tabs1.length - 1;
      });
      return;
    }
  }

  tabs.value = [
    {
      options: props.options,
      selected: null,
    },
  ];
};

const updateValue = (value: string) => {
  if (value !== undefined) {
    const values = tabs.value.map((tab: ITab) => tab.selected?.[valueKey]);
    if (values.indexOf(value) > -1) {
      return;
    }
  }
  innerValue.value = value;
  updateTabs();
};

watch(() => props.modelValue, updateValue, {
  deep: true,
  immediate: true,
});

watch(() => props.options, () => {
  updateTabs();
}, {
  deep: true,
  immediate: false,
});

const updateFieldNames = () => {
  const fieldNames = props.fieldNames;
  textKey = fieldNames?.text || defaultFieldNames.text;
  valueKey = fieldNames?.value || defaultFieldNames.value;
  childrenKey = fieldNames?.children || defaultFieldNames.children;
};

watch(() => props.fieldNames, updateFieldNames, {
  deep: true,
  immediate: true,
});
const popup = ref(null);
const handleInput = () => {
  popup.value.open();
};

const handleClear = () => {
  innerValue.value = '';
  innerText.value = '';
  emit('update:modelValue', '');
  emit('confirm', {
    value: innerValue.value,
    selectedOptions: []
  });
};

const onClickTab = (tabIndex, tab) => {
  emit('click-tab', { title: tab[textKey], tabIndex });
  activeTab.value = tabIndex;
};

const onSelect = (option: any, tabIndex: number) => {
  if (option && option.disabled) {
    return;
  }
  tabs.value[tabIndex].selected = option;

  if (tabs.length > tabIndex + 1) {
    tabs.value.splice(tabIndex + 1);
  }

  if (option[childrenKey]) {
    const nextTab = {
      options: option[childrenKey],
      selected: null,
    };
    if (tabs.value[tabIndex + 1]) {
      tabs.value.splice(tabIndex + 1, 1, nextTab);
    } else {
      tabs.value.push(nextTab);
    }
    nextTick(() => {
      activeTab.value = tabIndex + 1;
    });
  }

  const selectedOptions = tabs.value.map((tab) => tab.selected);
  const value = option?.[valueKey];

  const params = {
    value,
    tabIndex,
    selectedOptions,
  };
  innerValue.value = value;
  innerText.value = option?.[textKey];
  emit('change', params);
  if (!option[childrenKey]) {
    // popup.value.close();
    emit('finish', params);
  }
}

const isSelected = (tab, option) => {
  return tab.selected && tab.selected[valueKey] === option[valueKey]
}

const hide = () => {
  popup.value.close();
  innerText.value = '';
  innerValue.value = '';
  emit('close');
};

const confirm = () => {
  popup.value.close();
  emit('update:modelValue', innerValue.value);
  emit('confirm', {
    value: innerValue.value,
    selectedOptions: tabs.value.map((tab) => tab.selected)
  });
};

</script>
<style lang="scss" scoped>
.uni-data-input {
  position: relative;
  /* #ifndef APP-NVUE */
  display: flex;
  /* #endif */
  flex-direction: row;
  align-items: center;
  flex-wrap: nowrap;
  font-size: 14px;
  /* line-height: 35px; */
  padding: 0 10px;
  padding-right: 5px;
  overflow: hidden;
  height: 35px;
  /* #ifndef APP-NVUE */
  box-sizing: border-box;
  /* #endif */
  border: 1px solid #e5e5e5;
  border-radius: 5px;
  .selected-item {
    flex: 1;
    width: 100%;
  }
  .placeholder {
    font-size: 28rpx;
    color: #b3b3b3;
    font-weight: 400;
  }
  .clear {
    position: absolute;
    right: 4px;
  }
}
.uni-tabs {
  &__nav {
    position: relative;
    display: flex;
    padding: 0 12rpx;
    user-select: none;
  }
}
.uni-tab {
  position: relative;
  flex: 1;
  box-sizing: border-box;
  min-width: 0; /* hack for flex ellipsis */
  padding: 0 5px;
  text-align: center;
  cursor: pointer;
  color: #646566;
  font-size: 28rpx;
  line-height: 88rpx;

  &--active {
    position: relative;
    font-weight: 500;
    color: #2979ff;
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 80rpx;
      height: 3px;
      background-color: #2979ff;
      border-radius: 3px;
      transform: translateX(-50%);
    }
  }

  &--disabled {
    color: #c8c9cc;
  }

  &__title {
    &__info {
      position: relative !important;
      top: -1px !important;
      transform: translateX(0) !important;
    }
  }
}
.uni-cascader {
  background-color: #fff;
  border-radius: 16px 16px 0 0;
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 96rpx;
    padding: 0 32rpx;
  }
  &__close {
    color: #969799;
    font-size: 28rpx;
    line-height: 40rpx;
  }

  &__confirm {
    color: #2979ff;
    font-size: 28rpx;
    line-height: 40rpx;
  }

  &__title {
    font-weight: 600;
    font-size: 32rpx;
    line-height: 40rpx;
  }

  &__tabs {
    &-wrap {
      padding: 0 8px;
      height: 96rpx !important;
    }
  }

  &__tab {
    flex: none !important;
    padding: 0 8px !important;
    color: #323233 !important;
    font-weight: 600 !important;

    &--unselected {
      color: #969799 !important;
      font-weight: normal !important;
    }
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;

    &:active {
      background-color: #f2f3f5;
    }

    &--selected {
      color: #2979ff;
      font-weight: 600;
    }

    &--disabled {
      color: #c8c9cc;
      cursor: not-allowed;

      &:active {
        background-color: transparent;
      }
    }
  }

  &__options {
    box-sizing: border-box;
    height: 384px;
    padding-top: 6px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>

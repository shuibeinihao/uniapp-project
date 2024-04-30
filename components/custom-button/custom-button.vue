<script setup lang="ts">
  const props = defineProps<{
    size ?: 'default' | 'mini'
    class ?: string;
    disabled ?: boolean;
  }>()

  const emit = defineEmits<{
    (event : 'click') : void;
  }>()

  const handleClick = () => {
    if (props.disabled) return;

    emit('click');
  }
</script>

<template>
  <view :class="['custom-button', props.size, props.class, {disabled: props.disabled}]" @click="handleClick">
    <view>
      <slot></slot>
    </view>
  </view>
</template>

<style scoped lang="scss">
  .custom-button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    height: 40px;
    border-radius: 5px;
    padding: 0 15px;
    text-align: center;
    font-size: 14px;
    background-color: #2979ff;
    color: #eee;

    &.mini {
      height: 29px;
      font-size: 12px;
    }

    &:active {
      background-color: #55aaff;
      color: #fff;
    }
    
    &.disabled {
      background-color: #eee;
      color: #aaa;
      border-color: #555;
    }
  }
</style>
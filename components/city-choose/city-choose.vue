<script setup lang="ts">
  import {
    ref
  } from "vue";
  import {
    resetParams
  } from "../../utils";
  import {
    getLevelList,
    getTargetByName,
  } from "../../utils/address";

  const searchValue = ref('')
  const emit = defineEmits < {
    (event: 'ok', value: {
      name: string;province ? : string;city ? : string;area ? : string;
    }): void;
  } > ()

  // const citys = getLevelList(1)
  const citys = [{
      label: '北京市',
      value: '110000'
    },
    {
      label: '上海市',
      value: '310100'
    },
    {
      label: '广州市',
      value: '440100'
    }, {
      label: '深圳市',
      value: '440300'
    },
    {
      label: '杭州市',
      value: '330100'
    },
  ]

  const searchResult = ref(null)

  function handleSearch(name: string) {
    if (!name) {
      searchResult.value = null
      return;
    }
    searchResult.value = getTargetByName(name)
  }

  function handleListItemClick(city: any) {
    emit('ok', {
      name: city.label,
      city: city.value
    })
  }

  function handleSearchResultClick(record) {

    const params: {
      name: string;province ? : string;city ? : string;area ? : string;
    } = {
      name: record.label,
    }
    if (record.level === 0) {
      params.province = record.value;
    } else if (record.level === 1) {
      params.city = record.value;
    } else if (record.level === 2) {
      params.area = record.value;
    }

    emit('ok', params)
  }
</script>

<template>
  <view class="container">
    <uni-search-bar @confirm="handleSearch(searchValue)" v-model="searchValue" cancelButton="none"
      placeholder="请输入地区名称搜索">
    </uni-search-bar>
    <view v-if="!searchResult" class="list">
      <view class="list-item" @click="()=> emit('ok', {name: '全国'})">全国</view>
      <view v-for="item in citys" :key="item.value" class="list-item" @click="()=> handleListItemClick(item)">
        {{item.label}}
      </view>
    </view>
    <view v-else-if="searchResult && searchResult.length === 0" class="empty">
      未找到相关地区
    </view>
    <view v-else-if="searchResult" class="list">
      <view v-for="item in searchResult" :key="item.value" class="list-item"
        @click="()=> handleSearchResultClick(item)">{{item.label}}
      </view>
    </view>
  </view>
  <view>

  </view>
</template>

<style scoped lang="scss">
  .container {
    height: 70vh;
    min-height: 400px;
    overflow: auto;
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    padding: 10px;
  }

  .list-item {
    width: calc(33.33% - 7px);
    margin: 0 5px 10px 5px;
    padding: 3px 4px;
    text-align: center;
    box-sizing: border-box;
    background-color: #f2f2f2;

    &:nth-child(3n+1) {
      margin-left: 0;
    }

    &:nth-child(3n+3) {
      margin-right: 0;
    }
  }

  .empty {
    margin: 10px;
    text-align: center;
  }
</style>

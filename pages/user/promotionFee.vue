<template>
	<view class="page">
		<view class="list" v-if="dataList?.refList?.length>0">
			<view class="list-item">
				<view>入职满3天：{{dataList.refStats.entryCount || '-' }}次</view>
				<view>结算：{{dataList.refStats.settlementCount || '-' }}次</view>
				<view>赚到推荐费：{{dataList.refStats.amount || '-'}}元</view>
			</view>
			<view v-for="item in dataList.refList" :key="item.id" class="list-item">
				<view>面试时间：{{item.interviewDate || '-'}}</view>
				<view>类型：{{item.positionTypeName || '-'}}</view>
				<view>企业简称：{{item.enterpriseSimpleName || '-'}}</view>
				<view>姓名：{{item.customerName || '-'}}</view>
				<view>性别：{{item.sex === 'F'?'女':'男'}}</view>
				<view>推荐费结算状态：{{getRowsName(item.referenceState, labelState.data?.placement_position_info_settle_status)}}</view>
				<view>金额：{{item.referenceAmount || '-'}}元</view>
				<view>备注：{{item.referenceDesc || '-'}}</view>
			</view>
		</view>
		<data-empty v-else text="还没有推荐好友，快邀请好友一起入职吧"></data-empty>
	</view>
</template>

<script setup lang='ts'>
	import {
	  getRowsName,
	} from '@/utils'
	import {
	  useRequest
	} from "@/utils/hooks";
	import {
		onLoad,
	} from "@dcloudio/uni-app";
	import request from "@/utils/request";
	import {ref} from 'vue'
	const dataList = ref();
	onLoad(() => {
		request({
		  url: '/mobile/receivable/stats',
		  method: 'get',
		}).then(res => {
		  const data = res.data
		  if (data) {
			  dataList.value = data;
		    console.log('data',data);
		  }
		})
	})
const {
    state: labelState
  } = useRequest({
    url: '/system/dict/data/listAll',
    method: 'get',
    formatted: (res : any) => {
      const data : Record<string, Array<{
        key : string; name : string;
      }>> = {}

      if (Array.isArray(res)) {
        res.forEach((item : any) => {
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
  })
</script>

<style lang="scss" scoped>
	.page {
		min-height: 100vh;
		background-color: #f5f5f5;

		.list {
			position: relative;
			padding: 24rpx;

			&-item {
				position: relative;
				margin-bottom: 10px;
				padding: 10px;
				font-size: 12px;
				color: #333;
				line-height: 1.5;
				border-radius: 10rpx;
				box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.05);
				background-color: #fff;

				&-header {
					display: flex;
					justify-content: space-between;
					margin-bottom: 5px;
				}

				.list-item-title {
					font-size: 14px;
					font-weight: bold;
					margin-right: 10px;
				}
			}
		}
	}
</style>
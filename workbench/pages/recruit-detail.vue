<template>
  <view class="page">
    <uni-forms ref="formRef" :modelValue="formModel" :label-width="90">
      <uni-forms-item label="类型" name="postType">
        <uni-easyinput type="text" :value="getRowsName(formModel.postType, labelState?.data?.enterprise_post_info_post_type)" disabled />
      </uni-forms-item>
      <uni-forms-item label="企业简称" name="enterpriseName">
        <uni-easyinput type="text" v-model="formModel.enterpriseName" disabled placeholder="请输入企业简称" />
      </uni-forms-item>
      <uni-forms-item label="工种" name="workType">
        <uni-easyinput type="text" :value="getRowsName(formModel.workType, labelState?.data?.enterprise_post_info_work_type)" disabled />
      </uni-forms-item>
      <uni-forms-item label="报价" name="offerPrice">
        <uni-easyinput type="text" :value="getRowsName(formModel.offerPrice, labelState?.data?.enterprise_post_info_offer_price)" disabled />
      </uni-forms-item>
      <uni-forms-item label="岗位亮点" name="postLight">
        <multiple-select
          v-model="formModel.postLight"
          zindex="14"
          placeholder="请选择岗位亮点"
          :options="labelState?.data?.enterprise_post_info_post_light"
        ></multiple-select>
      </uni-forms-item>
      <uni-forms-item label="性别要求" name="genderNeed">
        <uni-easyinput type="text" v-model="formModel.genderNeed" placeholder="请输入性别要求" maxlength="100" />
      </uni-forms-item>
      <uni-forms-item label="男性人数" name="maleNumber">
        <uni-easyinput type="number" v-model="formModel.maleNumber" placeholder="请输入男性人数，如：50人" />
      </uni-forms-item>
      <uni-forms-item label="女性人数" name="femaleNumber">
        <uni-easyinput type="number" v-model="formModel.femaleNumber" placeholder="请输入女性人数，如：50人" />
      </uni-forms-item>
      <uni-forms-item label="男年龄" name="maleAge">
        <uni-easyinput type="number" v-model="formModel.maleAge" placeholder="请输入男年龄，如：18-50" />
      </uni-forms-item>
      <uni-forms-item label="女年龄" name="femaleAge">
        <uni-easyinput type="number" v-model="formModel.femaleAge" placeholder="请输入女年龄，如：18-50" />
      </uni-forms-item>
      <uni-forms-item label="招聘政策" name="recruitPolicy">
        <uni-easyinput type="textarea" v-model="formModel.recruitPolicy" autoHeight placeholder="请输入招聘政策"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="入职须知" name="inductionNoticy">
        <uni-easyinput type="textarea" v-model="formModel.inductionNoticy" autoHeight placeholder="请输入入职须知"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="面试安排" name="interviewPlan">
        <multiple-select
          v-model="formModel.interviewPlan"
          zindex="13"
          placeholder="请选择面试安排"
          :options="labelState?.data?.enterprise_post_info_interview_plan"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.interviewPlanAdd" autoHeight placeholder="请输入面试安排"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="入职材料" name="inductionDetail">
        <multiple-select
          v-model="formModel.inductionDetail"
          zindex="12"
          placeholder="请选择入职材料"
          :options="labelState?.data?.enterprise_post_info_induction_detail"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.inductionDetailAdd" autoHeight placeholder="请输入补充入职材料说明0-50个字"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="体检" name="bodyTest">
        <multiple-select
          v-model="formModel.bodyTest"
          zindex="11"
          placeholder="请选择体检"
          :options="labelState?.data?.enterprise_post_info_body_test"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.bodyTestAdd" autoHeight placeholder="请输入说明0-50个字"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="工作地址" name="region">
        {{ getAddress([formModel.workProvince, formModel.workCity, formModel.workArea]) }}
        <uni-cascader title="请选择城市" :options="provinces" v-model="city" @change="onChange" @confirm="handleCityConfirm"></uni-cascader>
      </uni-forms-item>
      <uni-forms-item label="详细地址" name="workAddress">
        <uni-easyinput type="textarea" v-model="formModel.workAddress" autoHeight placeholder="请输入详细地址" maxlength="100"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="住" name="live">
        <multiple-select
          v-model="formModel.live"
          zindex="10"
          placeholder="请选择住"
          :options="labelState?.data?.enterprise_post_info_live"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.liveAdd" autoHeight placeholder="请输入说明0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="吃" name="eat">
        <multiple-select
          v-model="formModel.eat"
          zindex="9"
          placeholder="请选择吃"
          :options="labelState?.data?.enterprise_post_info_eat"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.eatAdd" autoHeight placeholder="请输入说明0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="工作内容" name="workContent">
        <uni-easyinput type="textarea" v-model="formModel.workContent" autoHeight placeholder="请输入工作内容"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="作业环境" name="operationEnv">
        <multiple-select
          v-model="formModel.operationEnv"
          zindex="8"
          placeholder="请选择作业环境"
          :options="labelState?.data?.enterprise_post_info_operation_env"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.operationEnvAdd" autoHeight placeholder="请输入说明0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="着装" name="clothing">
        <multiple-select
          v-model="formModel.clothing"
          zindex="7"
          placeholder="请选择着装"
          :options="labelState?.data?.enterprise_post_info_clothing"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.clothingAdd" autoHeight placeholder="请输入说明0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="作业姿态" name="operationPose">
        <multiple-select
          v-model="formModel.operationPose"
          zindex="6"
          placeholder="请选择作业姿态"
          :options="labelState?.data?.enterprise_post_info_operation_pose"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.operationPoseAdd" autoHeight placeholder="请输入说明0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="排班" name="rostering">
        <multiple-select
          v-model="formModel.rostering"
          zindex="5"
          placeholder="请选择排班"
          :options="labelState?.data?.enterprise_post_info_rostering"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.rosteringAdd" autoHeight placeholder="请输入说明0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="户籍/民族" name="nation">
        <multiple-select
          v-model="formModel.nation"
          zindex="4"
          placeholder="请选择户籍/民族"
          :options="labelState?.data?.enterprise_post_info_nation"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.nationAdd" autoHeight placeholder="请输入说明0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="纹身" name="tattoo">
        <multiple-select
          v-model="formModel.tattoo"
          zindex="3"
          placeholder="请选择纹身"
          :options="labelState?.data?.enterprise_post_info_tattoo"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.tattooAdd" autoHeight placeholder="请输入说明0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="学历" name="education">
        <multiple-select
          v-model="formModel.education"
          zindex="2"
          placeholder="请选择学历"
          :options="labelState?.data?.enterprise_post_info_education"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.educationAdd" autoHeight placeholder="请输入说明0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="工作经验" name="workExperience">
        <uni-easyinput type="textarea" v-model="formModel.workExperience" autoHeight placeholder="请输入工作经验"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="复职条件" name="officeCondition">
        <uni-easyinput type="textarea" v-model="formModel.officeCondition" autoHeight placeholder="请输入复职条件"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="保险方案" name="insuranceScheme">
        <multiple-select
          v-model="formModel.insuranceScheme"
          zindex="1"
          placeholder="请选择保险方案"
          :options="labelState?.data?.enterprise_post_info_insurance_scheme"
        ></multiple-select>
        <uni-easyinput type="textarea" v-model="formModel.insuranceSchemeAdd" autoHeight placeholder="请输入说明0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="推荐费" name="recommendFee">
        <uni-easyinput type="textarea" v-model="formModel.recommendFee" autoHeight placeholder="请输入推荐费0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
      <uni-forms-item label="经纪人提成" name="agentRate">
        <uni-easyinput type="textarea" v-model="formModel.agentRate" autoHeight placeholder="请输入经纪人提成0-50个字" maxlength="50"></uni-easyinput>
      </uni-forms-item>
    </uni-forms>
    <view class="footer">
      <button class="save-btn" @click="submitForm" :loading="submitting">提交</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, computed } from 'vue';
import { onLoad } from "@dcloudio/uni-app";
import { useRequest } from "@/utils/hooks";
import { getRowsName, formatRichTextToText } from '@/utils';
import request from '../../utils/request';
import { getAddress } from '@/utils/address'

const formRef = ref(null)
const formModel = ref({})
const submitting = ref(false)

onLoad((options) => {
  run({ recruitmentId: options.recruitmentId });
})

const { state, run } = useRequest({
  url: '/goods/recruitment/getInfoById',
  method: 'get',
  manual: true,
  formatted: (res: any) => {
    formModel.value = res;
    formModel.value.recruitPolicy = formatRichTextToText(res.recruitPolicy);
    formModel.value.inductionNoticy = formatRichTextToText(res.inductionNoticy);
    formModel.value.workContent = formatRichTextToText(res.workContent);
    formModel.value.workExperience = formatRichTextToText(res.workExperience);
    formModel.value.officeCondition = formatRichTextToText(res.officeCondition);
  }
})

const {
  state: labelState
} = useRequest({
  url: '/system/dict/data/listAll',
  method: 'get',
  formatted: (res : any) => {
    const data : Record<string, Array<{
      value : string; text : string;key: string; name: string;
    }>> = {}

    if (Array.isArray(res)) {
      res.forEach((item : any) => {
        const key = `${item.dictType}`
        if (!data[key]) {
          data[key] = [{ value: item.dictValue, text: item.dictLabel, key: item.dictValue, name: item.dictLabel }]
        } else {
          data[key].push({ value: item.dictValue, text: item.dictLabel, key: item.dictValue, name: item.dictLabel})
        }
      })
    }
    return data;
  }
})

const provinces = ref([]);
const city = ref('');
const getProvince = () => {
  useRequest({
    url: '/basic/province/queryEnterpriseProvince',
    method: 'get',
    params: {
      // recruitmentDate: dayjs().format('YYYY-MM-DD')
    },
    formatted: (res: any) => {
      provinces.value = res.map((item: any) => {
        return {
          text: item.provinceName,
          value: item.provinceCode
        }
      });
      provinces.value.unshift({
        text: '全国',
        value: ''
      });
    }
  });
};

const getCity = (provinceCode: string) => {
  if (!provinceCode) {
    return;
  }
  const index = provinces.value.findIndex(item => item.value === provinceCode);
  if (index > -1 && provinces.value[index].children && provinces.value[index].children.length > 0) {
    return;
  }
  useRequest({
    url: '/basic/city/queryEnterpriseCity',
    method: 'get',
    params: {
      // recruitmentDate: dayjs().format('YYYY-MM-DD'),
      provinceCode: provinceCode
    },
    formatted: (res: any) => {
      provinces.value[index].children = res.map((item: any) => {
        return {
          text: item.cityName,
          value: item.cityCode
        }
      });
    }
  });
}

// 获取区县
const getArea = (cityCode: string, tabIndex) => {
  const option = getSelectedOptionsByValue(provinces.value, cityCode);
  const currentCity = option[tabIndex];
  if (option && option[tabIndex] && option[tabIndex].children && option[tabIndex].children.length > 0) {
    return;
  }
  useRequest({
    url: '/basic/area/queryEnterpriseArea',
    method: 'get',
    params: {
      // recruitmentDate: dayjs().format('YYYY-MM-DD'),
      cityCode: cityCode
    },
    formatted: (res: any) => {
      if (currentCity) {
        currentCity.children = res?.map((item: any) => {
          return {
            text: item.areaName,
            value: item.areaCode
          }
        });
      }
    }
  });
}

const getSelectedOptionsByValue = (options: Array<any>, value: string) => {
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    
    if (option.value === value) {
      return [option];
    }

    if (option.children) {
      const selectedOptions = getSelectedOptionsByValue(option.children, value);
      if (selectedOptions) {
        return [option, ...selectedOptions];
      }
    }
  }
};

getProvince();

const onChange = (e) => {
  if (e.tabIndex === 0) {
    getCity(e.value);
  } else if (e.tabIndex === 1) {
    getArea(e.value, e.tabIndex);
  }
};

const handleCityConfirm = (e) => {
  const { value, selectedOptions } = e;
  const selected = selectedOptions.filter(p => !!p);
  console.log('selected', selected, value)
  formModel.value.workProvince = selected[0]?.value;
  formModel.value.workCity = selected[1]?.value;
  formModel.value.workArea = selected[2]?.value;
}

const submitForm = () => {
  formRef.value.validate(() => {
    submitting.value = true;
    request({
      url: '/goods/recruitment/modify',
      data: formModel.value
    }).then(() => {
      submitting.value = false;
      uni.showToast({ title: '保存成功' });
      uni.$emit('updateRecruitList');
      setTimeout(() => {
        uni.navigateBack();
      }, 500);
    }).catch(() => {
      submitting.value = false;
      uni.showToast({ title: '保存失败', icon: 'none' });
    });
  })
}
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx 24rpx 150rpx;
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
  z-index: 99;
  .save-btn {
    height: 40px;
    line-height: 40px;
    background-color: $uni-primary;
    color: #fff;
  }
}
</style>

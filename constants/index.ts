import { optionsToObject } from "@/util";

export const statusArr = [
  { key: "E", name: "启用" },
  { key: "D", name: "禁用" },
];

export const sexArr = [
  { key: "F", name: "女" },
  { key: "M", name: "男" },
];

export const interviewStatusArr = [
  { label: "准备面试", value: "S" },
  { label: "放弃", value: "C" },
  { label: "未通过", value: "R" },
  { label: "通过", value: "P" },
];
export const signStatusArr = [
  { label: "取消", value: "C" },
  { label: "暂停", value: "R" },
  { label: "已签到", value: "P" },
];
export const entryStatusArr = [
  { label: "未报到", value: "C" },
  { label: "被拒绝", value: "R" },
  { label: "入职", value: "P" },
];
export const departStatusArr = [
  { label: "自离", value: "1" },
  { label: "劝退", value: "2" },
  { label: "满3天", value: "3" },
  { label: "满月", value: "4" },
];
export const memberSettleStatusArr = [
  { label: "终止", value: "1" },
  { label: "待查", value: "2" },
  { label: "达标", value: "3" },
  { label: "担保", value: "4" },
  { label: "其它", value: "5" },
  { label: "已结算", value: "6" },
  { label: "部分结算", value: "7" },
];
export const referenceSettleStatusArr = [
  { label: "终止", value: "1" },
  { label: "待查", value: "2" },
  { label: "达标", value: "3" },
  { label: "担保", value: "4" },
  { label: "其它", value: "5" },
  { label: "已结算", value: "6" },
  { label: "部分结算", value: "7" },
];
export const agentSettleStatusArr = [
  { label: "终止", value: "1" },
  { label: "待查", value: "2" },
  { label: "达标", value: "3" },
  { label: "担保", value: "4" },
  { label: "其它", value: "5" },
  { label: "已结算", value: "6" },
  { label: "部分结算", value: "7" },
];

export const platformObj: Record<string, string> = {
  "MP-WEIXIN": "微信小程序",
  "MP-ALIPAY": "支付宝小程序",
  "MP-BAIDU": "百度小程序",
  "MP-TOUTIAO": "字节跳动小程序",
  "MP-LARK": "飞书小程序",
  "MP-QQ": "QQ小程序",
  "MP-KUAISHOU": "快手小程序",
  "MP-JD": "京东小程序",
  "MP-360": "360小程序",
};

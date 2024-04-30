/** 手机号码 */
export const regularPhone = /^1[0-9]{10}$/;

/** 邮箱名 */
export const regularEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

/** 用户名 */
export const regularChannelUserName = /^[a-zA-Z][-\w]{3,15}$/;

/** 密码 */
export const regularChannelPassWord = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,18}$/;

/** IDCard号码 */
export const regularIDCardNo = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;

/** 数字 */
export const regularNumber = /^[0-9]*$/;

/** 正整数  */
export const regularNumberInt = /^[1-9][0-9]{0,}$/;

/** 姓名 */
export const regularName = /^[\u2E80-\u9FFF]+$/;

/** 金额 */
export const regularFund = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;

/** 中文 数字 英文 特殊符号._-+ */
export const regularPatrolName = /^[\u4e00-\u9fa5\a-\z\A-\Z0-9\.\_\-\+]*$/;

/** 中文 数字 英文 */
export const regularPatrolAlert = /(^[\s.]*([^\s.][\s.]*){1,100})/;

/** 数字 英文 特殊符号._-+/等 */
export const regularConsumablesCode = /^[\a-\z\A-\Z0-9\.\_\-\+\/]*$/;

/** 数字 英文 */
export const regularAssetCode = /^[\a-\z\A-\Z0-9\/]*$/;

/** 中文 数字 英文 */
export const regularAssetName = /^[\u4e00-\u9fa5\a-\z\A-\Z0-9\/]*$/;

/** http */
export const regularHttp = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
/** https */
export const regularHttps = /https:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;

/** 函数，更严格地测试身份证号 */
export const testIDCard = (code:string) => {
  const city: Record<string, string> = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
    91: '国外',
  };
  let pass = true; // 验证失败返回false
  if (
    !code ||
    !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)
  ) {
    pass = false;
  } else if (!city[code.slice(0, 2)]) {
    pass = false;
  } else if (code.length === 18) {
    // 18位身份证需要验证最后一位校验位
    const arr = code.split('');
    // ∑(ai×Wi)(mod 11)
    // 加权因子
    const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    // 校验位
    const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    let ai = 0;
    let wi = 0;
    for (let i = 0; i < 17; i += 1) {
      ai = +arr[i];
      wi = factor[i];
      sum += ai * wi;
    }
    if (String(parity[sum % 11]) !== String(arr[17].toUpperCase())) {
      pass = false;
    }
  }
  return pass;
};

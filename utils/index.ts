import dayjs from "dayjs";

export const formateDateTime = function(dateTime?: string, format?: string) {
  if (!dateTime) return '';
  return dayjs(dateTime).format(format || 'YYYY/MM/DD HH:mm:ss')
}


export const getHomeWeek = function(instance: any) {
  const day = instance.day();
  const dayStr = ['日', '一', '二', '三', '四', '五', '六'][day]
  return instance.format(`M月D日 周${dayStr}`)
}

export const getCompanyWeek = function(instance: any) {
  const day = instance.day();
  const dayStr = ['日', '一', '二', '三', '四', '五', '六'][day]
  return instance.format(`(M月D日)周${dayStr}`)
}

export const resetParams = function(params: Record<string, any>) {
  const obj: Record<string, any> = {};
  const keys = Object.keys(params);
  keys.forEach(key => {
    let value = params[key];
    if (value !== null && value !== '' && value !== undefined) {
      obj[key] = params[key]
    }
  })
  return obj;
}

export const optionsToObject = function(options) {
  return Object.fromEntries(options.map(item => [item.value, item.label]))
}

export const isObject = (value: any) => {
  return value !== null && (typeof value == 'object' || typeof value == 'function')
}

export const isObjectValueEqual = function(a: any, b: any) {
  //取对象a和b的属性名
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);
  //判断属性名的length是否一致
  if (aProps.length != bProps.length) {
    return false;
  }
  //循环取出属性名，再判断属性值是否一致
  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];
    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
}


export const isArrayValueEqual = function(a: Array<string | number>, b: Array<string | number>): boolean {
  for (let i = 0; i < a.length; i++) {
    const v = a[i];
    if (!b.includes(v)) {
      return false;
    }
  }

  for (let i = 0; i < b.length; i++) {
    const v = b[i];
    if (!a.includes(v)) {
      return false;
    }
  }

  return true;
}

type LabelRows = Array<{ key?: string; name?: string; text?: string; value?: string; label?: string }>

export const getRowsName = function (
  key?: string,
  rows?: LabelRows,
  afterDetail?: string
) {
  if (!key) return "";
  const names: string[] = [];
  let str = "";
  key.split(",").forEach((v) => {
    const target = rows?.find((item) => item.key === v || item.value === v);

    return names.push(target ? target.name || target.label || key : key);
  });
  str = names.join(",");
  if (afterDetail && afterDetail.trim() !== "") {
    str += `(${afterDetail})`;
  }
  return str;
};

export const getRowsArray = function(key?: string, rows?: LabelRows) {
  if (!key || !rows) return [];
  const array: Array<{ value: string, label: string; }> = [];
  key.split(',').forEach(v => {
    const target = rows?.find(item => item.key === key || item.value == key)
    return array.push({
      value: key,
      label: target ? target.name || target.text : ''
    })
  })
  return array
}

export const log = (msg: any) => {
  console.log(msg)
}

export const getUserAge = (idcard?: string) => {
  if (!idcard || idcard.length !== 18) return '';
  const birthDay = idcard.slice(6, 14)
  return dayjs().diff(birthDay, 'years');
}

export const formatRichText = (str: string) => {
  if (!str) return '';
  const wrapper = `<div style="line-height: 1.5">${str}</div>`
  // return str.replace(/<p style="/g, '<p style="margin:10px 0;').replace(/<p>/g, '<p style="margin:10px 0">')
  return wrapper.replace(/&nbsp;/g, '\xa0');
}

// 把富文本转成纯文本，小程序
export const formatRichTextToText = (str: string) => {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '\xa0');
}

export const formattedDict = (arr: Array) => {
  if (!arr || arr.length === 0) return [];
  const result = arr.map((item) => {
    return {
      value: item.value,
      text: item.label,
    };
  });
  result.unshift({
    value: '_isEmpty',
    text: '?'
  });
  return result;
}
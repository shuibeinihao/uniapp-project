// const baseUrl = 'https://app.jwzp.vip';
const baseUrl = 'https://jenkins.jwzp.vip/prod-api';
const imgUrl = 'http://image.jwzp.vip/'

const platform = process.env.UNI_PLATFORM.toUpperCase();

const request = function(options: {
  url: string;
  data?: any;
  method?: any;
  timeout?: number;
  dataType?: string;
  responseType?: string;
  withCredentials?: boolean;
}) {
  const { url, data = {}, method = 'POST', ...otherOptions } = options;
  
  return new Promise<any>((resolve, reject) => {
    uni.request({
      ...otherOptions,
      url: url.startsWith('http') ? url : (baseUrl + url),
      method,
      data,
      header: {
        token: uni.getStorageSync('token'),
        platform: platform === 'H5' ? 'MP-WEIXIN' : platform,
      },
      success: (res: any) => {
        if (res.statusCode === 200 && res.data && res.data.code == '200') {
          resolve(res.data)
        } else {
          reject({
            message: res.data ? `${res.data.errorInfo || res.data.message || res.data.msg || ''} ${res.data.errorDetail || ''}` :
              `${res.error} ${res.message}`
          })
        }
      },
      fail: reject
    })

  })
}

export const uploadFile = function({
  filePath,
  name = 'file',
  formData
}: { filePath: string; name?: string; formData?: any }) {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: baseUrl + '/common/upload',
      filePath,
      name,
      formData,
      success: (res) => {
        const data = JSON.parse(res.data)
        resolve(data)
      },
      fail: reject
    });
  })
}

export default request;
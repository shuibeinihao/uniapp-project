import { setGlobalData } from "../global_data";
import app from "../utils/application";
import request from "../utils/request"

/** 高德地图key */
const AmapKey = "c34af6843acb00625955b659a3c79194";

/** 逆地理 location: 经度,纬度 */
export const getUserCityByPoi = (location : string) => {
  return new Promise((resolve, reject) => {

    uni.request({
      url: `https://restapi.amap.com/v3/geocode/regeo?key=${AmapKey}&location=${location}`,
      method: 'POST',
      success(res : any) {
        console.log('resss', res)
        if (res.data.status === '1') {
          resolve(res.data.regeocode)
        }
      },
      fail(err) {
        reject(err)
      }
    })

  })
}

export const doReferrerInfo = (referrerId ?: string) => {

  if (!referrerId) return;
  setGlobalData('referrerId', referrerId)
  request({
    url: `/member/customer/${referrerId}`,
    method: 'GET'
  }).then(res => {
    if (res.data) {
      setGlobalData('referrerInfo', res.data)
    }
  }).catch(() => { })
}

type Location = {
  longitude : number,
  latitude : number
}


/** 
 *  查询骑行路径
 * @param origin - 起始点经纬度
 * @param destination - 目的地经纬度
 * */
export const getRidingRoute = (origin: string, destination : string) : Promise<{
  points : Location[],
  distance : number;
}> => {

  return new Promise((resolve, reject) => {

    uni.request({
      url: `https://restapi.amap.com/v4/direction/bicycling?key=d255d01a120bebd774bfca62c482960e&origin=${origin}&destination=${destination}`,
      success(res : any) {
        if (res.statusCode === 200 && res.data.data) {
          const data = res.data.data;
          var points : Location[] = [], distance : number = 0;
          if (data.paths && data.paths[0] && data.paths[0].steps) {
            var steps = data.paths[0].steps;
            for (var i = 0; i < steps.length; i++) {
              var poLen = steps[i].polyline.split(';');
              for (var j = 0; j < poLen.length; j++) {
                points.push({
                  longitude: parseFloat(poLen[j].split(',')[0]),
                  latitude: parseFloat(poLen[j].split(',')[1])
                })
              }
            }
          }

          if (data.paths[0] && data.paths[0].distance) {
            distance = data.paths[0].distance
          }

          resolve({
            points,
            distance
          })
        } else {
          reject()
        }
      },
      fail() {
        reject()
      }
    })

  })

}
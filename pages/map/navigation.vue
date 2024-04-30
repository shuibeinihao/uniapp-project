  <script setup>
    import {
      onLoad,
    } from "@dcloudio/uni-app";
    import {
      ref
    } from "vue";
    import {
      getRidingRoute
    } from "../../services/api";
    import app from "../../utils/application";
    import request from "../../utils/request";

    const center = ref({
      latitude: 39.909,
      longitude: 116.39742,
    })

    let destination = ''

    const targetName = ref('')

    const markers = ref([])

    const polylines = ref([])

    onLoad((query) => {
      const {
        targetLnglat,
        targetName
      } = query;
      if (targetName)
        if (targetLnglat) {
          destination = targetLnglat;
          const lnglat = targetLnglat.split(',');
          center.value = {
            longitude: lnglat[0],
            latitude: lnglat[1],
          }
          markers.value = [{
            id: '1',
            longitude: lnglat[0],
            latitude: lnglat[1],
            iconPath: '../../static/position-fill.png',
            width: 38,
            height: 38
          }]
        }
    })

    const handleNavigation = () => {
      if (!destination) return;
      
      app.getLocation().then(location=>{
        const origin = location.longitude + ',' + location.latitude;
       
        getRidingRoute(origin, destination).then(res => {
          polylines.value = [{
            points: res.points,
            width: 5,
            color: "#16CC34",
            arrowLine: true
          }]
          console.log(res)
          markers.value = [{
            id: 'destination',
            longitude: destination.split(',')[0],
            latitude: destination.split(',')[1],
            iconPath: '../../static/position-fill.png',
            width: 38,
            height: 38
          }, {
            id: 'origin',
            longitude: location.longitude,
            latitude: location.latitude,
            iconPath: '../../static/position-origin.png',
            width: 38,
            height: 38
          }, ]
        })
      })
    }
  </script>

  <template>
    <view>
      <map style="width: 100%; height: 100vh;" :latitude="center.latitude" :longitude="center.longitude"
        :markers="markers" :polyline="polylines">
      </map>
      <cover-view class="bottom-box" v-if="targetName">
        <cover-view class="address">{{targetName}}</cover-view>
        <cover-view class="button" @click="handleNavigation">导航</cover-view>
      </cover-view>
    </view>
  </template>

  <style scoped lang="scss">
    .bottom-box {
      position: fixed;
      bottom: 0%;
      left: 0%;
      width: 100%;
      border-top-left-radius: 10px;
      border-top-right-radius: 6px;
      background-color: #fff;
      padding: 20px 15px;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
      overflow: hidden;
      z-index: 1;

      .address {
        font-size: 16px;
      }

      .button {
        width: 100px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        background-color: $uni-primary;
        color: #fff;
        border-radius: 14px;
      }
    }
  </style>
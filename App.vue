<script>
  import app from './utils/application'
  import dayjs from 'dayjs';
  //1. 导入统一身份信息管理模块
	import uniIdPagesInit from '@/uni_modules/uni-id-pages/init.js';
	//2. 导入uniIm的Utils工具类
	import uniImUtils from '@/uni_modules/uni-im/common/utils.js';
  
  export default {
    onLaunch: function(e) {
      // 删除超时的pk记录
      const pkList = app.globalData.get('pk_list') || [];
      const newPkList = pkList.filter(item=> dayjs(item.recruitmentDate) < dayjs());
      app.globalData.set('pk_list', newPkList);
      //3. 初始化uni身份信息管理模块
			uniIdPagesInit();
			//4. 初始化uniIm
			uniImUtils.init();
    },
    onShow: function() {
      console.log('App Show')
    },
    onHide: function() {
      console.log('App Hide')
    }
  }
</script>

<style lang="scss">
  /*每个页面公共css */
  @import '@/uni_modules/uni-scss/index.scss';

  .example-info {
    font-size: 14px;
    color: #333;
    padding: 10px;
  }
  .uni-select__input-placeholder {
    font-size: 28rpx !important;
    color: #b3b3b3 !important;
  }
  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    padding: 12rpx 32rpx 24rpx;
    background-color: #fff;
    box-shadow: 0 -2rpx 4rpx 0 rgba(0, 0, 0, 0.1);
    z-index: 99;
    button {
      width: 100%;
    }
  }
</style>
